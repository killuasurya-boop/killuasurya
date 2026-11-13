\set ON_ERROR_STOP off
\pset format unaligned
\pset tuples_only on
insert into auth.users (id, raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000001','{"full_name":"Surya"}'),('00000000-0000-0000-0000-000000000002','{"full_name":"Ares"}'),
 ('00000000-0000-0000-0000-000000000003','{"full_name":"Bima"}'),('00000000-0000-0000-0000-000000000004','{"full_name":"Klien A"}'),('00000000-0000-0000-0000-000000000005','{"full_name":"Klien B"}');
update public.profiles set role='owner' where full_name='Surya'; update public.profiles set role='editor' where full_name='Ares'; update public.profiles set role='publisher' where full_name='Bima';
insert into public.clients (id,name) values ('10000000-0000-0000-0000-00000000000a','A'),('10000000-0000-0000-0000-00000000000b','B');
insert into public.client_members values ('10000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-000000000004'),('10000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-000000000005');
insert into public.projects (id,client_id,name) values ('20000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-00000000000a','PA'),('20000000-0000-0000-0000-00000000000b','10000000-0000-0000-0000-00000000000b','PB');
insert into public.tasks (id,project_id,title,stage,status,pic) values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-00000000000a','Edit A','editing','progress','00000000-0000-0000-0000-000000000002'),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-00000000000b','Publish B','publishing','scheduled','00000000-0000-0000-0000-000000000003');
\echo == anon
set role anon;
insert into public.leads (name,contact,consent) values ('Budi','0812345678',true);
\echo anon lead ok ^ ; without consent / forced status / read:
insert into public.leads (name,contact,consent) values ('Budi','0812345678',false);
insert into public.leads (name,contact,consent,status) values ('Budi','0812345678',true,'won');
select 'anon leads visible: '||count(*) from public.leads;
select 'anon tasks: '||count(*) from public.tasks;
reset role;
\echo == editor (Ares)
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
select 'ares tasks: '||count(*) from public.tasks;
select 'ares leads: '||count(*) from public.leads;
select 'ares audit: '||count(*) from public.audit_log;
update public.tasks set status='approved' where id='30000000-0000-0000-0000-000000000001';
update public.tasks set pic='00000000-0000-0000-0000-000000000003' where id='30000000-0000-0000-0000-000000000001';
update public.tasks set status='review', stage='owner' where id='30000000-0000-0000-0000-000000000001';
update public.tasks set status='progress' where id='30000000-0000-0000-0000-000000000001';
update public.tasks set status='completed' where id='30000000-0000-0000-0000-000000000002' returning 'ares touched other task!';
update public.profiles set role='owner' where id=auth.uid();
insert into public.task_history (task_id,entry) values ('30000000-0000-0000-0000-000000000001','fake');
reset role;
\echo == publisher (Bima)
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000003';
update public.tasks set status='published' where id='30000000-0000-0000-0000-000000000002';
update public.tasks set status='published', published_url='https://example.com/p/1' where id='30000000-0000-0000-0000-000000000002' returning 'bima published ok';
reset role;
\echo == client A
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000004';
select 'clientA projects: '||string_agg(name,',') from public.projects;
select 'clientA tasks: '||string_agg(title,',') from public.tasks;
select 'clientA profiles: '||count(*) from public.profiles;
update public.tasks set status='approved' where id='30000000-0000-0000-0000-000000000001' returning 'client updated task!';
insert into public.tasks (project_id,title) values ('20000000-0000-0000-0000-00000000000a','x');
reset role;
\echo == owner
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
update public.tasks set status='revision', stage='editing' where id='30000000-0000-0000-0000-000000000001' returning 'owner revision ok';
select 'owner leads: '||count(*) from public.leads;
select 'history rows: '||count(*) from public.task_history;
select 'audit rows: '||count(*) from public.audit_log;
