import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const A='00000000-0000-4000-8000-000000000001', B='00000000-0000-4000-8000-000000000002';
test('PostgreSQL migration: RLS, CAS sync, XP dedup/cap and opt-in leaderboard',async()=>{
  const db=new PGlite();
  try{
    // Test-only Auth identity shim. Production uses Supabase's JWT-verified auth.uid().
    await db.exec(`create role authenticated nologin;create schema auth;create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public,auth to authenticated;grant execute on function auth.uid() to authenticated;
      insert into auth.users values('${A}'),('${B}');`);
    await db.exec(await readFile(new URL('../supabase/migrations/20261023000100_private_core.sql',import.meta.url),'utf8'));
    await db.exec(`set role authenticated;set request.jwt.claim.sub='${A}';`);
    const sync=()=>db.query<{sync_state:number}>(`select public.sync_state($1,$2::jsonb)`,[0,JSON.stringify({version:1,note:'private A'})]);
    assert.equal((await sync()).rows[0].sync_state,1);
    await assert.rejects(sync(),/SYNC_CONFLICT/);
    assert.equal((await db.query('select * from public.user_snapshots')).rows.length,1);
    await assert.rejects(()=>db.query(`update public.user_snapshots set revision=999`),/permission denied/i);
    await assert.rejects(()=>db.query(`insert into public.profiles(id) values('${B}')`),/row-level security/i);
    await db.exec(`set request.jwt.claim.sub='${B}';`);
    assert.equal((await db.query('select * from public.user_snapshots')).rows.length,0);
    await db.query(`select public.sync_state(0,'{"version":1,"note":"private B"}')`);
    assert.equal((await db.query('select * from public.user_snapshots')).rows.length,1);
    await db.exec(`set request.jwt.claim.sub='${A}';`);
    const award=async(id:string,kind='reading_session')=>(await db.query<{record_activity:number}>(`select public.record_activity($1,$2,$3::jsonb)`,[id,kind,JSON.stringify({page:1,completed:true,note:'must not be stored'})])).rows[0].record_activity;
    const event='10000000-0000-4000-8000-000000000001';assert.equal(await award(event),10);assert.equal(await award(event),0);
    for(let i=2;i<15;i++)await award(`10000000-0000-4000-8000-${String(i).padStart(12,'0')}`);
    assert.equal((await db.query<{total:number}>('select sum(amount)::integer total from public.xp_events')).rows[0].total,100);
    assert.equal((await db.query<{leaks:number}>(`select count(*)::integer leaks from public.activity_events where payload ? 'note'`)).rows[0].leaks,0);
    await assert.rejects(()=>db.query(`insert into public.xp_events(user_id,source_type,source_id,amount) values('${A}','fake','fake',100)`),/permission denied/i);
    assert.equal((await db.query('select * from public.get_leaderboard()')).rows.length,0);
    await db.query(`update public.profiles set alias='Tester A',leaderboard_opt_in=true,adult_consent=true where id='${A}'`);
    assert.deepEqual((await db.query('select alias,xp from public.get_leaderboard()')).rows,[{alias:'Tester A',xp:100}]);
    await db.query(`update public.profiles set leaderboard_opt_in=false where id='${A}'`);
    assert.equal((await db.query('select * from public.get_leaderboard()')).rows.length,0);
    await db.query('select public.delete_my_account()');
    assert.equal((await db.query('select * from public.user_snapshots')).rows.length,0);
    await db.exec(`reset role;`);
    assert.equal((await db.query(`select * from public.xp_events where user_id='${A}'`)).rows.length,0);
    assert.equal((await db.query('select * from auth.users')).rows.length,1);
  } finally{await db.close();}
});
