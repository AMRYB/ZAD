import {Directory,File,Paths} from 'expo-file-system';
import {openDatabaseAsync,type SQLiteDatabase} from 'expo-sqlite';
import type {OfflineEntry,OfflineJob,OfflineResource,OfflineStore} from '../core/offline-quran';
let database:Promise<SQLiteDatabase>|null=null;
const directory=()=>new Directory(Paths.document,'zad-quran-offline-v1');
function file(key:string){if(!/^[A-Za-z0-9._-]{1,160}$/.test(key)||key.includes('..'))throw new Error('INVALID_CACHE_KEY');return new File(directory(),key);}
function ready(){return database??=(async()=>{
  const dir=directory();dir.create({intermediates:true,idempotent:true});
  const db=await openDatabaseAsync('zad-quran-offline-v1.db');
  await db.execAsync('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS entries(key TEXT PRIMARY KEY,bytes INTEGER NOT NULL,mime TEXT NOT NULL); CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,payload TEXT NOT NULL);');return db;
})().catch(error=>{database=null;throw error;});}
export const offlineStore:OfflineStore={
  async entries(){const rows=await (await ready()).getAllAsync<OfflineEntry>('SELECT key,bytes,mime FROM entries'),valid:OfflineEntry[]=[];
    for(let i=0;i<rows.length;i++){const row=rows[i];try{const f=file(row.key);if(f.exists&&f.size===row.bytes)valid.push(row);}catch{}if(i%100===99)await new Promise(r=>setTimeout(r,0));}return valid;},
  async jobs(){return (await (await ready()).getAllAsync<{payload:string}>('SELECT payload FROM jobs ORDER BY rowid')).flatMap(row=>{try{return [JSON.parse(row.payload) as OfflineJob];}catch{return [];}});},
  async saveJob(job){await (await ready()).runAsync('INSERT INTO jobs(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload',job.id,JSON.stringify(job));},
  async deleteJob(id){await (await ready()).runAsync('DELETE FROM jobs WHERE id=?',id);},
  async put(resource:OfflineResource,data:Uint8Array,mime:string){
    const db=await ready();if(Paths.availableDiskSpace<data.length+5*1024*1024)throw new Error('DISK_FULL');
    const temp=file(resource.key+'.part'),target=file(resource.key);
    try{temp.create({overwrite:true});await temp.write(data);await temp.move(target,{overwrite:true});
      await db.runAsync('INSERT INTO entries(key,bytes,mime) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET bytes=excluded.bytes,mime=excluded.mime',resource.key,data.length,mime);
    }finally{if(temp.exists&&temp.uri!==target.uri)temp.delete();}
  },
  async exists(entry){try{const f=file(entry.key);return f.exists&&f.size===entry.bytes;}catch{return false;}},
  async uri(entry){const f=file(entry.key);return f.exists&&f.size===entry.bytes?f.uri:null;},
  async text(entry){const f=file(entry.key);return f.exists&&f.size===entry.bytes?f.text():null;},
  async remove(key){const db=await ready(),f=file(key);if(f.exists)f.delete();await db.runAsync('DELETE FROM entries WHERE key=?',key);},
};
