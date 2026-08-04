import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdir,mkdtemp,unlink,rmdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {MIGRATION_SQL,UPSERT_SQL} from '../src/storage/schema.ts';
import {initialState,reducer,restoreState} from '../src/core/model.ts';
test('SQLite schema persists an atomic snapshot across close and reopen',async()=>{
  const base=new URL('../.test-output/',import.meta.url);await mkdir(base,{recursive:true});
  const folder=await mkdtemp(fileURLToPath(new URL('sqlite-',base)));const filename=`${folder}/state.db`;
  let db:DatabaseSync|undefined;
  try{
    db=new DatabaseSync(filename);db.exec(MIGRATION_SQL);
    const state=reducer(initialState(),{type:'note',date:'2026-10-22',text:"Private ' note & Unicode عربي"});
    db.prepare(UPSERT_SQL).run(JSON.stringify(state));db.close();
    db=new DatabaseSync(filename);db.exec(MIGRATION_SQL);
    const row=db.prepare('select payload from app_state where id=1').get() as {payload:string};
    assert.deepEqual(restoreState(row.payload),state);
    db.prepare(UPSERT_SQL).run(JSON.stringify({...state,locale:'en'}));assert.equal((db.prepare('select count(*) n from app_state').get() as {n:number}).n,1);
  }finally{db?.close();for(const suffix of ['','-wal','-shm'])await unlink(filename+suffix).catch(()=>{});await rmdir(folder);}
});
