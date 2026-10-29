import type {OfflineEntry,OfflineJob,OfflineStore} from '../core/offline-quran';
type StoredEntry=OfflineEntry&{blob:Blob};
let database:Promise<IDBDatabase>|null=null;
const urls=new Map<string,string>();
function ready(){return database??=new Promise<IDBDatabase>((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(new Error('OFFLINE_STORAGE_UNAVAILABLE'));return;}
  const request=indexedDB.open('zad-quran-offline-v1',1);
  request.onupgradeneeded=()=>{request.result.createObjectStore('entries',{keyPath:'key'});request.result.createObjectStore('jobs',{keyPath:'id'});};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
}).catch(error=>{database=null;throw error;});}
async function run<T>(name:string,mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T>{
  const db=await ready();return new Promise<T>((resolve,reject)=>{
    const tx=db.transaction(name,mode),request=action(tx.objectStore(name));
    tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error??request.error);tx.onabort=()=>reject(tx.error??request.error);
  });
}
const get=(key:string)=>run<StoredEntry|undefined>('entries','readonly',s=>s.get(key));
export const offlineStore:OfflineStore={
  async entries(){return (await run<StoredEntry[]>('entries','readonly',s=>s.getAll())).filter(e=>e.blob instanceof Blob&&e.blob.size===e.bytes).map(({key,bytes,mime})=>({key,bytes,mime}));},
  jobs:()=>run<OfflineJob[]>('jobs','readonly',s=>s.getAll()),
  async saveJob(job){await run('jobs','readwrite',s=>s.put(job));},
  async deleteJob(id){await run('jobs','readwrite',s=>s.delete(id));},
  async put(resource,data,mime){await run('entries','readwrite',s=>s.put({key:resource.key,bytes:data.length,mime,blob:new Blob([new Uint8Array(data)],{type:mime})}));},
  async exists(entry){const e=await get(entry.key);return !!e&&e.blob instanceof Blob&&e.blob.size===entry.bytes;},
  async uri(entry){const e=await get(entry.key);if(!e)return null;let url=urls.get(entry.key);if(!url){url=URL.createObjectURL(e.blob);urls.set(entry.key,url);}return url;},
  async text(entry){const e=await get(entry.key);return e?e.blob.text():null;},
  async remove(key){await run('entries','readwrite',s=>s.delete(key));const url=urls.get(key);if(url)URL.revokeObjectURL(url);urls.delete(key);},
};
