-- Synthetic identities only. Every insert/update/delete in this smoke run is rolled back.
begin;
insert into auth.users(id,aud,role,email,created_at,updated_at) values
 ('90000000-0000-4000-8000-000000000001','authenticated','authenticated','zad-qa-a@example.invalid',now(),now()),
 ('90000000-0000-4000-8000-000000000002','authenticated','authenticated','zad-qa-b@example.invalid',now(),now());
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $checks$
begin
 perform public.sync_state(0,'{"version":1,"note":"synthetic A"}');
 if (select count(*) from public.user_snapshots)<>1 then raise exception 'OWN_READ_FAILED';end if;
 begin
  update public.user_snapshots set revision=999;
  raise exception 'DIRECT_REVISION_WRITE_ALLOWED';
 exception when insufficient_privilege then null;end;
 begin
  perform public.sync_state(0,'{"version":1}');raise exception 'STALE_CAS_ALLOWED';
 exception when serialization_failure then null;end;
 begin
  insert into public.profiles(id) values('90000000-0000-4000-8000-000000000002');raise exception 'CROSS_USER_CREATE_ALLOWED';
 exception when insufficient_privilege then null;end;
 if public.record_activity('a0000000-0000-4000-8000-000000000001','daily_checkin','{}')<>5 then raise exception 'AWARD_FAILED';end if;
 if public.record_activity('a0000000-0000-4000-8000-000000000001','daily_checkin','{}')<>0 then raise exception 'DUPLICATE_AWARD';end if;
 if (select count(*) from public.get_leaderboard())<>0 then raise exception 'DEFAULT_BOARD_LEAK';end if;
end $checks$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $checks$
begin
 if (select count(*) from public.user_snapshots)<>0 then raise exception 'CROSS_USER_READ_ALLOWED';end if;
 perform public.sync_state(0,'{"version":1,"note":"synthetic B"}');
end $checks$;
select set_config('request.jwt.claims','{"sub":"90000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $checks$
begin
 if (select payload->>'note' from public.user_snapshots)<>'synthetic A' then raise exception 'OWNER_STATE_CHANGED';end if;
 perform public.delete_my_account();
end $checks$;
reset role;
do $checks$
begin
 if exists(select 1 from auth.users where id='90000000-0000-4000-8000-000000000001') then raise exception 'OWN_DELETE_FAILED';end if;
 if not exists(select 1 from auth.users where id='90000000-0000-4000-8000-000000000002') then raise exception 'OTHER_ACCOUNT_DELETED';end if;
end $checks$;
rollback;
select 'PASS: own-user RLS, denied cross-user/direct writes, CAS, XP replay, private board and scoped deletion; all synthetic writes rolled back' as result;
