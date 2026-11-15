import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { templates } from '../../src/lib/templates.ts';

// Real PostgreSQL RLS, functions and triggers in an ephemeral WASM database.
// Auth/Storage API services are deliberately absent; this never connects to a cloud project.
const db = new PGlite();
const uid = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const project = '20000000-0000-0000-0000-000000000001';
const task = '30000000-0000-0000-0000-000000000001';
const material = '40000000-0000-0000-0000-000000000001';
const checklist = '50000000-0000-0000-0000-000000000001';
async function asUser(n, run) {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${uid(n)}'`);
  try { return await run(); }
  finally { await db.exec("reset role; reset request.jwt.claim.sub"); }
}
async function count(table) { return Number((await db.query(`select count(*) as n from public.${table}`)).rows[0].n); }

before(async () => {
  await db.exec(await readFile(new URL('../../supabase/tests_stub.sql', import.meta.url), 'utf8'));
  await db.exec(`create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated;
    grant select, insert, update, delete on storage.objects to authenticated;`);
  const root = new URL('../../supabase/migrations/', import.meta.url);
  for (const file of (await readdir(root)).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(await readFile(new URL(file, root), 'utf8'));
  }
  await db.exec(`insert into auth.users(id) values ('${uid(1)}'), ('${uid(2)}'), ('${uid(3)}'), ('${uid(4)}');
    update public.profiles set role = 'owner' where id = '${uid(1)}';
    update public.profiles set role = 'editor' where id = '${uid(2)}';
    insert into public.clients(id, name) values ('10000000-0000-0000-0000-000000000001', 'Client A');
    insert into public.client_members values ('10000000-0000-0000-0000-000000000001', '${uid(3)}');
    insert into public.projects(id, client_id, name) values ('${project}', '10000000-0000-0000-0000-000000000001', 'Project A');
    insert into public.tasks(id, project_id, title, stage, status, pic) values ('${task}', '${project}', 'Editing A', 'editing', 'progress', '${uid(2)}');
    insert into public.task_checklist(id, task_id, text) values ('${checklist}', '${task}', 'Review');
    insert into public.project_materials(id, project_id, label) values ('${material}', '${project}', 'Logo');
    insert into storage.objects(bucket_id, name) values ('project-files', '${project}/logo.png');`);
});
after(async () => { await db.close(); });

test('all application tables have RLS and the active-account restriction', async () => {
  const { rows } = await db.query(`select c.relname, c.relrowsecurity,
    exists(select 1 from pg_policy p where p.polrelid = c.oid and p.polname = 'active_account' and not p.polpermissive) as guarded
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'`);
  assert.equal(rows.length, 14);
  assert.ok(rows.every((r) => r.relrowsecurity && r.guarded));
});

test('active client sees their project, unrelated client sees none, editor cannot self-promote', async () => {
  await asUser(3, async () => { assert.equal(await count('projects'), 1); assert.equal(await count('tasks'), 1); });
  await asUser(4, async () => { assert.equal(await count('projects'), 0); assert.equal(await count('tasks'), 0); });
  await asUser(2, async () => {
    assert.equal(await count('tasks'), 1);
    await assert.rejects(db.exec(`update public.profiles set role = 'owner' where id = '${uid(2)}'`), /Hanya Owner/);
    await assert.rejects(db.exec(`select public.task_transition('${task}', 'approve')`), /Hanya Owner/);
  });
});

test('deactivated client loses table, Storage and definer RPC access despite keeping the same JWT subject', async () => {
  await db.exec(`update public.profiles set active = false where id = '${uid(3)}'`);
  try {
    await asUser(3, async () => {
      assert.equal(await count('projects'), 0);
      assert.equal(await count('tasks'), 0);
      assert.equal(await count('project_materials'), 0);
      assert.equal((await db.query('select * from public.my_client_ids()')).rows.length, 0);
      assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
      await assert.rejects(db.exec(`select public.material_mark_sent('${material}', 'File siap')`), /Tidak diizinkan/);
      await assert.rejects(db.exec(`select public.client_decide('${task}', 'approve')`), /Tidak diizinkan/);
      await assert.rejects(db.exec(`insert into storage.objects(bucket_id, name) values ('project-files', '${project}/bad.png')`), /row-level security/);
    });
  } finally { await db.exec(`update public.profiles set active = true where id = '${uid(3)}'`); }
});

test('deactivated PIC cannot read or edit tasks/checklists or call workflow RPCs', async () => {
  await db.exec(`update public.profiles set active = false where id = '${uid(2)}'`);
  try {
    await asUser(2, async () => {
      assert.equal(await count('tasks'), 0);
      assert.equal(await count('task_checklist'), 0);
      assert.equal((await db.query(`update public.task_checklist set done = true where id = '${checklist}' returning id`)).rows.length, 0);
      await assert.rejects(db.exec(`select public.task_transition('${task}', 'start')`), /Tidak diizinkan/);
      await assert.rejects(db.exec(`insert into public.task_checklist(task_id, text) values ('${task}', 'Injected')`), /row-level security/);
    });
  } finally { await db.exec(`update public.profiles set active = true where id = '${uid(2)}'`); }
});

test('an active client assigned as PIC still cannot edit the checklist', async () => {
  await db.exec(`update public.tasks set pic = '${uid(3)}' where id = '${task}'`);
  try {
    await asUser(3, async () => {
      assert.equal(await count('tasks'), 1);
      assert.equal((await db.query(`update public.tasks set title = 'Injected' where id = '${task}' returning id`)).rows.length, 0);
      assert.equal((await db.query(`update public.task_checklist set done = true where id = '${checklist}' returning id`)).rows.length, 0);
    });
  } finally { await db.exec(`update public.tasks set pic = '${uid(2)}' where id = '${task}'`); }
});

test('active client can still submit materials and editor can still work on their task', async () => {
  await asUser(3, async () => { await db.exec(`select public.material_mark_sent('${material}', 'File siap')`); });
  assert.equal((await db.query(`select status from public.project_materials where id = '${material}'`)).rows[0].status, 'sent');
  await asUser(2, async () => { await db.exec(`update public.task_checklist set done = true where id = '${checklist}'`); });
  assert.equal((await db.query(`select done from public.task_checklist where id = '${checklist}'`)).rows[0].done, true);
});

const materials = [{ label: 'Logo brand', detail: 'PNG', fallback: null, required: true }];
const plan = [{ title: 'Editing awal', stage: 'editing', role: 'editor', day: 1, client: true, checklist: ['Potong klip', 'Review akhir'] }];
const templateRpc = (client, tasks = plan) => db.query(
  `select public.create_project_with_template($1, 'Project atomik', 'landing-event', null, $2::jsonb, $3::jsonb) as id`,
  [client, JSON.stringify(materials), JSON.stringify(tasks)],
);
const taskRpc = (client, checks = ['Cek awal'], pic = uid(2), projectId = null) => db.query(
  `select public.create_task_with_checklist($1::uuid, $2, 'Project tugas', 'Editing atomik', '', 'editing', $3::uuid, null, 2::smallint, $4::jsonb) as id`,
  [projectId, client, pic, JSON.stringify(checks)],
);

test('atomic project RPC creates the complete kit and assigns an active role-matched PIC', async () => {
  const result = await asUser(1, () => templateRpc('Client atomik'));
  const id = result.rows[0].id;
  const tasks = (await db.query('select * from public.tasks where project_id = $1', [id])).rows;
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].pic, uid(2));
  assert.equal(tasks[0].status, 'waiting');
  assert.equal(tasks[0].day_offset, 0);
  assert.equal(tasks[0].needs_client, true);
  assert.equal((await db.query('select * from public.project_materials where project_id = $1', [id])).rows.length, 1);
  assert.deepEqual((await db.query('select text from public.task_checklist where task_id = $1 order by position', [tasks[0].id])).rows.map((r) => r.text), plan[0].checklist);
});

test('both creation RPCs roll back even when a late checklist trigger fails', async () => {
  await db.exec(`create function public.test_reject_checklist() returns trigger language plpgsql as $$
    begin if new.text = 'SIMULATE_FAILURE' then raise exception 'simulated late failure'; end if; return new; end $$;
    create trigger test_reject_checklist before insert on public.task_checklist for each row execute function public.test_reject_checklist();`);
  try {
    const tables = ['clients', 'projects', 'tasks', 'project_materials', 'task_checklist'];
    const before = await Promise.all(tables.map(count));
    await asUser(1, async () => {
      await assert.rejects(templateRpc('Client rollback template', [{ ...plan[0], checklist: ['Cek awal', 'SIMULATE_FAILURE'] }]), /simulated late failure/);
      await assert.rejects(taskRpc('Client rollback task', ['Cek awal', 'SIMULATE_FAILURE']), /simulated late failure/);
    });
    assert.deepEqual(await Promise.all(tables.map(count)), before);
  } finally { await db.exec('drop trigger test_reject_checklist on public.task_checklist; drop function public.test_reject_checklist()'); }
});

test('only an active Owner can create work; PIC must be an active staff member', async () => {
  for (const user of [2, 3]) await asUser(user, async () => {
    await assert.rejects(templateRpc('Client unauthorized'), /Hanya Owner/);
    await assert.rejects(taskRpc('Client unauthorized'), /Hanya Owner/);
  });
  await asUser(1, async () => { await assert.rejects(taskRpc('Client bad PIC', [], uid(3)), /PIC harus staf aktif/); });
  await db.exec(`update public.profiles set active = false where id = '${uid(2)}'`);
  try { await asUser(1, async () => { await assert.rejects(taskRpc('Client inactive PIC'), /PIC harus staf aktif/); }); }
  finally { await db.exec(`update public.profiles set active = true where id = '${uid(2)}'`); }
  await db.exec(`update public.profiles set active = false where id = '${uid(1)}'`);
  try { await asUser(1, async () => { await assert.rejects(templateRpc('Client inactive Owner'), /Hanya Owner/); }); }
  finally { await db.exec(`update public.profiles set active = true where id = '${uid(1)}'`); }
});

test('atomic task RPC reuses an existing project and inserts an ordered checklist', async () => {
  const clientsBefore = await count('clients');
  const projectsBefore = await count('projects');
  const result = await asUser(1, () => taskRpc('Unused client', ['Pertama', 'Kedua'], uid(2), project));
  assert.equal(await count('clients'), clientsBefore);
  assert.equal(await count('projects'), projectsBefore);
  assert.deepEqual((await db.query('select text from public.task_checklist where task_id = $1 order by position', [result.rows[0].id])).rows.map((r) => r.text), ['Pertama', 'Kedua']);
});

test('business flow: consented lead → accepted quote → project → editor → client approval → publication → completion', async () => {
  await db.exec('set role anon');
  let lead;
  try {
    lead = (await db.query(`select public.submit_lead($1::jsonb, $2) as id`, [JSON.stringify({ name: 'UAT Contact', contact: 'uat@example.test', consent: true }), 'uat-flow-sender-0000000000000001'])).rows[0].id;
  } finally { await db.exec('reset role'); }
  const quote = await asUser(1, async () => {
    const q = (await db.query(`insert into public.quotations(title, client_name, lead_id, items) values ('UAT paket', 'Client A', $1, $2::jsonb) returning id, total`, [lead, JSON.stringify([{ desc: 'Produksi konten', qty: 2, price: 250000 }])])).rows[0];
    assert.equal(Number(q.total), 500000);
    await db.query(`update public.quotations set status = 'sent' where id = $1`, [q.id]);
    await assert.rejects(db.query(`update public.quotations set items = '[]'::jsonb where id = $1`, [q.id]), /Item hanya bisa diubah/);
    await db.query(`update public.quotations set status = 'accepted' where id = $1`, [q.id]);
    return q.id;
  });
  const pid = (await asUser(1, () => db.query('select public.quotation_to_project($1) as id', [quote]))).rows[0].id;
  assert.equal((await db.query('select status from public.leads where id = $1', [lead])).rows[0].status, 'won');
  const tid = (await asUser(1, () => taskRpc('Unused', ['Cek kualitas'], uid(2), pid))).rows[0].id;
  await db.exec(`insert into auth.users(id) values ('${uid(5)}'); update public.profiles set role = 'publisher' where id = '${uid(5)}'`);
  await asUser(2, async () => {
    await db.query(`select public.task_transition($1, 'start')`, [tid]);
    await db.query('update public.task_checklist set done = true where task_id = $1', [tid]);
    await db.query(`insert into public.task_comments(task_id, body) values ($1, 'Catatan internal editor')`, [tid]);
    await db.query(`select public.task_transition($1, 'submit')`, [tid]);
  });
  await asUser(1, () => db.query(`select public.task_transition($1, 'send_client', 'https://preview.example.test/uat')`, [tid]));
  await asUser(4, async () => { assert.equal((await db.query('select id from public.tasks where id = $1', [tid])).rows.length, 0); });
  await asUser(3, async () => {
    assert.equal((await db.query('select id from public.tasks where id = $1', [tid])).rows.length, 1);
    assert.equal((await db.query('select id from public.task_comments where task_id = $1', [tid])).rows.length, 0);
    await db.query(`select public.client_decide($1, 'approve', 'Disetujui klien')`, [tid]);
  });
  await asUser(5, async () => {
    await db.query(`select public.task_transition($1, 'start')`, [tid]);
    await db.query(`select public.task_transition($1, 'schedule')`, [tid]);
    await assert.rejects(db.query(`select public.task_transition($1, 'publish', '')`, [tid]), /Tautan publikasi wajib/);
    await db.query(`select public.task_transition($1, 'publish', 'https://example.test/published/uat')`, [tid]);
  });
  await asUser(1, () => db.query(`select public.task_transition($1, 'complete')`, [tid]));
  const final = (await db.query('select status, completed_at from public.tasks where id = $1', [tid])).rows[0];
  assert.equal(final.status, 'completed');
  assert.ok(final.completed_at);
  assert.ok((await db.query('select id from public.task_history where task_id = $1', [tid])).rows.length >= 7);
});

test('every committed template creates its full plan and starts deadlines only when materials are ready', async () => {
  for (const tpl of templates) {
    const pid = (await asUser(1, () => db.query(
      `select public.create_project_with_template($1, $2, $3, null, $4::jsonb, $5::jsonb) as id`,
      [`Template client ${tpl.id}`, tpl.name, tpl.id, JSON.stringify(tpl.materials), JSON.stringify(tpl.plan)],
    ))).rows[0].id;
    const tasks = (await db.query('select id, due, status from public.tasks where project_id = $1', [pid])).rows;
    assert.equal(tasks.length, tpl.plan.length, tpl.id);
    assert.ok(tasks.every((t) => t.status === 'waiting' && t.due === null));
    assert.equal((await db.query('select id from public.project_materials where project_id = $1', [pid])).rows.length, tpl.materials.length);
    const checks = (await db.query('select c.id from public.task_checklist c join public.tasks t on t.id = c.task_id where t.project_id = $1', [pid])).rows;
    assert.equal(checks.length, tpl.plan.reduce((n, t) => n + t.checklist.length, 0));
    await asUser(1, async () => {
      await assert.rejects(db.query(`select public.project_start($1, (now() at time zone 'Asia/Jakarta')::date)`, [pid]), /bahan wajib/);
      await db.query(`update public.project_materials set status = 'received' where project_id = $1 and required`, [pid]);
      await db.query(`select public.project_start($1, (now() at time zone 'Asia/Jakarta')::date)`, [pid]);
    });
    assert.ok((await db.query('select due from public.tasks where project_id = $1', [pid])).rows.every((t) => t.due !== null));
  }
});

test('release diagnostics confirm RLS, invoker RPC permissions and private Storage', async () => {
  const reports = await db.exec(await readFile(new URL('../../supabase/release_checks.sql', import.meta.url), 'utf8'));
  const coverage = reports[0].rows[0];
  assert.equal(Number(coverage.application_tables), 14);
  assert.equal(Number(coverage.tables_with_rls), 14);
  assert.equal(Number(coverage.tables_with_active_account_guard), 14);
  assert.equal(reports[1].rows.length, 2);
  assert.ok(reports[1].rows.every((r) => r.uses_invoker_rights && r.authenticated_can_execute && !r.anon_can_execute));
  assert.equal(reports[2].rows[0].public, false);
  assert.equal(Number(reports[2].rows[0].file_size_limit), 20971520);
});
