import test from 'node:test';
import assert from 'node:assert/strict';
import {QuranDownloads,offlineResource,offlineResources,validateOfflineContent,type OfflineEntry,type OfflineJob,type OfflinePlan,type OfflineResource,type OfflineStore} from '../src/core/offline-quran.ts';
import {hilitesUrl,pageImage,recitationUrl,tafsirUrl} from '../src/core/ksu.ts';
import {KSU_RECITERS,KSU_TAFSIRS} from '../src/data/ksu-readers.ts';
// Structural fixtures only; this synthetic data is never Quran content or a shipped asset.
const png=new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=','base64'));
const mp3=new Uint8Array(512);mp3.set([255,251,144,0]);
const encode=(s:string)=>new TextEncoder().encode(s);
const plan:OfflinePlan={kind:'mushaf',source:'hafs',from:1,to:1};
function fixture(r:OfflineResource){return {data:r.type==='png'?png:r.type==='mp3'?mp3:encode(r.type==='hilites'?JSON.stringify({[String(r.page)]:{'1_1':[100,300]}}):'fixture|||<p>fixture</p>'),mime:r.type==='png'?'image/png':r.type==='mp3'?'audio/mpeg':'text/html; charset=utf-8'};}
class MemoryStore implements OfflineStore {
  files=new Map<string,{entry:OfflineEntry;data:Uint8Array}>();manifest=new Map<string,OfflineJob>();failWrite='';
  async entries(){return [...this.files.values()].map(x=>({...x.entry}));}
  async jobs(){return [...this.manifest.values()].map(x=>({...x}));}
  async saveJob(j:OfflineJob){this.manifest.set(j.id,{...j});}
  async deleteJob(id:string){this.manifest.delete(id);}
  async put(r:OfflineResource,data:Uint8Array,mime:string){if(r.key===this.failWrite)throw new Error('DISK_FULL');this.files.set(r.key,{entry:{key:r.key,bytes:data.length,mime},data:new Uint8Array(data)});}
  async exists(e:OfflineEntry){return this.files.get(e.key)?.data.length===e.bytes;}
  async uri(e:OfflineEntry){return this.files.has(e.key)?`memory://${e.key}`:null;}
  async text(e:OfflineEntry){const data=this.files.get(e.key)?.data;return data?new TextDecoder().decode(data):null;}
  async remove(key:string){this.files.delete(key);}
}
async function until(fn:()=>boolean){for(let i=0;i<1000;i++){if(fn())return;await new Promise(r=>setTimeout(r,1));}throw new Error('TEST_TIMEOUT');}
const finished=(e:QuranDownloads)=>until(()=>e.getSnapshot().active===null);
test('Offline plans cover all pages/coordinates and exactly the captured6236 ayahs for each source',()=>{
  assert.equal(offlineResources({kind:'mushaf',source:'hafs',from:1,to:604}).length,1208);
  for(const kind of ['audio','tafsir'] as const){const list=offlineResources({kind,source:kind==='audio'?'husary':'sa3dy',from:1,to:114});assert.equal(list.length,6236);assert.equal(new Set(list.map(r=>r.key)).size,6236);}
  for(const url of [pageImage(604),hilitesUrl(604),recitationUrl('husary',114,6),tafsirUrl('sa3dy',114,6)])assert.equal(offlineResource(url).url,url);
  for(const source of [...KSU_RECITERS.map(r=>({kind:'audio' as const,source:r.id})),...KSU_TAFSIRS.map(r=>({kind:'tafsir' as const,source:r.id}))])for(const r of offlineResources({...source,from:1,to:1})){assert.match(r.key,/^[A-Za-z0-9._-]{1,160}$/);assert.equal(offlineResource(r.url).key,r.key);}
  for(const url of ['https://example.com/1.png',pageImage(1)+'?token=x',hilitesUrl(1)+'&extra=1','https://quran.ksu.edu.sa/anything.zip','https://user:password@quran.ksu.edu.sa/ayat/safahat1/1.png'])assert.throws(()=>offlineResource(url));
  for(const bad of [{...plan,from:0},{...plan,to:605},{...plan,from:2,to:1},{...plan,source:'../other'},{kind:'audio',source:'unknown',from:1,to:1}])assert.throws(()=>offlineResources(bad as OfflinePlan));
});
test('Content checks reject partial PNGs, MP3 error pages, invalid coordinates and missing tafsir content',()=>{
  for(const r of [...offlineResources(plan),offlineResource(recitationUrl('husary',1,1)),offlineResource(tafsirUrl('sa3dy',1,1))]){const f=fixture(r);assert.doesNotThrow(()=>validateOfflineContent(r,f.data,f.mime));}
  assert.throws(()=>validateOfflineContent(offlineResource(pageImage(1)),png.slice(0,-12),'image/png'));
  assert.throws(()=>validateOfflineContent(offlineResource(recitationUrl('husary',1,1)),encode('<html>Unavailable</html>'),'audio/mpeg'));
  assert.throws(()=>validateOfflineContent(offlineResource(recitationUrl('husary',1,1)),new Uint8Array(256),'audio/mpeg'));
  for(const text of ['{}','{"1":{"1_1":["100",300]}}'])assert.throws(()=>validateOfflineContent(offlineResource(hilitesUrl(1)),encode(text),'text/html'));
  for(const text of ['unavailable','fixture|||'])assert.throws(()=>validateOfflineContent(offlineResource(tafsirUrl('sa3dy',1,1)),encode(text),'text/html'));
});
test('Downloads persist exact bytes and restored local reads need no network',async()=>{
  const store=new MemoryStore(),calls:string[]=[];const e=new QuranDownloads(store,async r=>{calls.push(r.key);return fixture(r);},async()=>{});
  await e.start(plan);await finished(e);assert.equal(e.getSnapshot().jobs[0].status,'complete');assert.equal(calls.length,2);
  const restored=new QuranDownloads(store,async()=>{throw new Error('OFFLINE');},async()=>{});await restored.init();
  assert.equal(restored.getSnapshot().jobs[0].status,'complete');assert.equal(await restored.uri(pageImage(1)),'memory://p-1.png');
  assert.deepEqual(store.files.get('p-1.png')!.data,png);assert.equal(JSON.parse((await restored.text(hilitesUrl(1)))!)['1']['1_1'][0],100);
});
test('Interrupted jobs retain completed files and resume only missing resources after restart',async()=>{
  const store=new MemoryStore();const e=new QuranDownloads(store,async r=>{if(r.type==='hilites')throw new Error('HTTP_503');return fixture(r);},async()=>{});
  await e.start(plan);await finished(e);assert.equal(e.getSnapshot().jobs[0].status,'error');assert.equal(e.getSnapshot().jobs[0].done,1);
  const calls:string[]=[];const resumed=new QuranDownloads(store,async r=>{calls.push(r.key);return fixture(r);},async()=>{});await resumed.init();assert.equal(resumed.getSnapshot().jobs[0].status,'paused');
  await resumed.start(plan);await finished(resumed);assert.deepEqual(calls,['h-1.json']);assert.equal(resumed.getSnapshot().jobs[0].status,'complete');
});
test('Pause aborts in-flight work without saving it; completed files survive',async()=>{
  const store=new MemoryStore();let waiting=false;
  const e=new QuranDownloads(store,async(r,signal)=>{if(r.type==='png')return fixture(r);waiting=true;return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('ABORTED')),{once:true}));},async()=>{});
  await e.start(plan);await until(()=>waiting);await e.pause();assert.equal(store.files.size,1);assert.equal(e.getSnapshot().jobs[0].status,'paused');
});
test('Parallel starts and deletion cannot create a second active worker',async()=>{
  const store=new MemoryStore();const e=new QuranDownloads(store,async(_r,signal)=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('ABORTED')),{once:true})),async()=>{});
  const starts=await Promise.allSettled([e.start(plan),e.start({...plan,from:2,to:2})]);assert.equal(starts.filter(x=>x.status==='fulfilled').length,1);assert.equal(starts.filter(x=>x.status==='rejected').length,1);
  await assert.rejects(e.remove(e.getSnapshot().jobs[0].id),/BUSY/);await e.pause();
});
test('Pausing after the last file commit still reports a complete package',async()=>{
  const store=new MemoryStore();let delays=0,waiting=false;
  const e=new QuranDownloads(store,async r=>fixture(r),async signal=>{if(++delays===2){waiting=true;await new Promise<void>((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('ABORTED')),{once:true}));}});
  await e.start(plan);await until(()=>waiting);await e.pause();assert.equal(e.getSnapshot().jobs[0].done,2);assert.equal(e.getSnapshot().jobs[0].status,'complete');
});
test('Deleting an overlapping package preserves files owned by another package',async()=>{
  const store=new MemoryStore(),e=new QuranDownloads(store,async r=>fixture(r),async()=>{});
  await e.start({...plan,to:2});await finished(e);await e.start(plan);await finished(e);assert.equal(store.files.size,4);
  await e.remove('mushaf:hafs:1:2');assert.equal(store.files.size,2);assert.ok(store.files.has('p-1.png'));assert.equal(e.getSnapshot().jobs[0].status,'complete');
  await e.remove('mushaf:hafs:1:1');assert.equal(store.files.size,0);
});
test('Quota failures never mark incomplete downloads available and corrupt stored plans cannot fetch',async()=>{
  const store=new MemoryStore();store.failWrite='h-1.json';let calls=0;
  const e=new QuranDownloads(store,async r=>{calls++;return fixture(r);},async()=>{});await e.start(plan);await finished(e);assert.equal(e.getSnapshot().jobs[0].done,1);assert.equal(e.getSnapshot().jobs[0].status,'error');
  store.manifest.set('bad',{...plan,id:'bad',source:'../../etc',status:'running',error:''});const second=new QuranDownloads(store,async()=>{throw new Error('MUST_NOT_FETCH');},async()=>{});await second.init();assert.equal(second.getSnapshot().jobs.length,1);assert.equal(second.getSnapshot().active,null);assert.equal(calls,2);
});
test('Missing local files invalidate availability and requests remain sequential and paced',async()=>{
  const store=new MemoryStore(),events:string[]=[];let active=0;
  const e=new QuranDownloads(store,async r=>{assert.equal(++active,1);events.push(r.type);await Promise.resolve();active--;return fixture(r);},async()=>{events.push('pace');});
  await e.start(plan);await finished(e);assert.deepEqual(events,['png','pace','hilites','pace']);store.files.delete('p-1.png');
  assert.equal(await e.uri(pageImage(1)),null);assert.equal(e.getSnapshot().jobs[0].status,'paused');assert.equal(e.getSnapshot().jobs[0].done,1);
});
