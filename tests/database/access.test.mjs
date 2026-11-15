import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

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
