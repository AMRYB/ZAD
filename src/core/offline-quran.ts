import {BASE,hilitesUrl,pageImage,recitationUrl,splitTafsir,tafsirUrl} from './ksu.ts';
import {KSU_RECITERS,reciterById,tafsirById} from '../data/ksu-readers.ts';
import {quran} from '../data/quran.ts';

export type OfflineKind='mushaf'|'audio'|'tafsir';
export interface OfflinePlan {kind:OfflineKind;source:string;from:number;to:number}
export interface OfflineResource {key:string;url:string;type:'png'|'mp3'|'hilites'|'tafsir';page?:number}
export interface OfflineEntry {key:string;bytes:number;mime:string}
export interface OfflineJob extends OfflinePlan {id:string;status:'paused'|'running'|'complete'|'error';error:string}
export interface OfflineStore {
  entries():Promise<OfflineEntry[]>;jobs():Promise<OfflineJob[]>;saveJob(job:OfflineJob):Promise<void>;deleteJob(id:string):Promise<void>;
  put(resource:OfflineResource,data:Uint8Array,mime:string):Promise<void>;exists(entry:OfflineEntry):Promise<boolean>;
  uri(entry:OfflineEntry):Promise<string|null>;text(entry:OfflineEntry):Promise<string|null>;remove(key:string):Promise<void>;
}
export interface DownloadSnapshot {ready:boolean;error:boolean;active:string|null;files:number;bytes:number;jobs:(OfflineJob&{done:number;total:number;bytes:number})[]}
export function offlineResources(plan:OfflinePlan):OfflineResource[]{
  const max=plan.kind==='mushaf'?604:114;
  if(!['mushaf','audio','tafsir'].includes(plan.kind)||!Number.isInteger(plan.from)||!Number.isInteger(plan.to)||plan.from<1||plan.to>max||plan.from>plan.to)throw new Error('INVALID_OFFLINE_PLAN');
  if(plan.kind==='mushaf'&&plan.source!=='hafs'||plan.kind==='audio'&&!reciterById(plan.source)||plan.kind==='tafsir'&&!tafsirById(plan.source))throw new Error('INVALID_OFFLINE_SOURCE');
  const items:OfflineResource[]=[];
  for(let n=plan.from;n<=plan.to;n++){
    if(plan.kind==='mushaf'){items.push({key:`p-${n}.png`,url:pageImage(n),type:'png',page:n},{key:`h-${n}.json`,url:hilitesUrl(n),type:'hilites',page:n});continue;}
    for(let a=1;a<=quran.Sura[n]!.ayas;a++)items.push(plan.kind==='audio'
      ?{key:`a-${reciterById(plan.source)!.folder}-${n}-${a}.mp3`,url:recitationUrl(plan.source,n,a),type:'mp3'}
      :{key:`t-${plan.source}-${n}-${a}.txt`,url:tafsirUrl(plan.source,n,a),type:'tafsir'});
  }return items;
}
/** Accept only exact URLs generated from the captured KSU contracts/catalogues. */
export function offlineResource(url:string):OfflineResource{
  const u=new URL(url);if(u.origin!==BASE||u.username||u.password||u.hash)throw new Error('KSU_ONLY');
  const page=u.pathname.match(/^\/ayat\/safahat1\/(\d+)\.png$/);
  if(page){const r=offlineResources({kind:'mushaf',source:'hafs',from:Number(page[1]),to:Number(page[1])})[0];if(r.url===url)return r;}
  const audio=u.pathname.match(/^\/ayat\/mp3\/([^/]+)\/(\d{3})(\d{3})\.mp3$/);
  if(audio){const reciter=KSU_RECITERS.find(r=>r.folder===audio[1]),s=Number(audio[2]),a=Number(audio[3]);if(reciter&&recitationUrl(reciter.id,s,a)===url)return {key:`a-${reciter.folder}-${s}-${a}.mp3`,url,type:'mp3'};}
  if(u.pathname==='/interface.php'&&u.searchParams.get('do')==='hilites'){
    const p=Number(u.searchParams.get('page'));if(hilitesUrl(p)===url)return {key:`h-${p}.json`,url,type:'hilites',page:p};
  }
  if(u.pathname==='/interface.php'&&u.searchParams.get('do')==='tafsir'){
    const author=u.searchParams.get('author')??'',s=Number(u.searchParams.get('sura')),a=Number(u.searchParams.get('aya'));
    if(tafsirUrl(author,s,a)===url)return {key:`t-${author}-${s}-${a}.txt`,url,type:'tafsir'};
  }throw new Error('UNSUPPORTED_OFFLINE_RESOURCE');
}
export function validateOfflineContent(resource:OfflineResource,data:Uint8Array,mime:string){
  if(!data.length||data.length>32*1024*1024)throw new Error('INVALID_CONTENT_SIZE');
  if(resource.type==='png'){
    if(![137,80,78,71,13,10,26,10].every((n,i)=>data[i]===n)||data.length<45||![0,0,0,0,73,69,78,68,174,66,96,130].every((n,i)=>data[data.length-12+i]===n))throw new Error('INVALID_PNG');
    return;
  }
  if(resource.type==='mp3'){
    if(!mime.toLowerCase().includes('audio/')||data.length<128)throw new Error('INVALID_MP3');
    const id3=data[0]===73&&data[1]===68&&data[2]===51;
    const offset=id3?10+((data[6]&127)<<21)+((data[7]&127)<<14)+((data[8]&127)<<7)+(data[9]&127)+(data[5]&16?10:0):0;
    for(let i=offset;i<Math.min(data.length-4,offset+65536);i++){
      const version=(data[i+1]>>3)&3,rateIndex=(data[i+2]>>2)&3,bitrateIndex=data[i+2]>>4;
      if(data[i]!==255||(data[i+1]&224)!==224||version===1||((data[i+1]>>1)&3)!==1||rateIndex===3||bitrateIndex===0||bitrateIndex===15)continue;
      const rate=[44100,48000,32000][rateIndex]/(version===3?1:version===2?2:4);
      const bitrate=(version===3?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[bitrateIndex];
      if(i+Math.floor((version===3?144:72)*bitrate*1000/rate)+((data[i+2]>>1)&1)<=data.length)return;
    }throw new Error('INVALID_MP3');
  }
  if(data.length>524288)throw new Error('INVALID_TEXT_SIZE');
  const text=new TextDecoder().decode(data);
  if(resource.type==='tafsir'){const parsed=splitTafsir(text);if(!parsed.verseText.trim()||!parsed.tafsirHtml.trim())throw new Error('INVALID_TAFSIR');return;}
  const points=JSON.parse(text)?.[String(resource.page)];
  if(!points||typeof points!=='object'||Array.isArray(points)||!Object.keys(points).length)throw new Error('INVALID_HILITES');
  for(const [key,value] of Object.entries(points))if(!/^\d+_\d+$/.test(key)||!Array.isArray(value)||value.length!==2||value.some(n=>typeof n!=='number'||!Number.isFinite(n)))throw new Error('INVALID_HILITES');
}
const jobId=(p:OfflinePlan)=>`${p.kind}:${p.source}:${p.from}:${p.to}`;
const sleep=(ms:number,signal:AbortSignal)=>new Promise<void>((resolve,reject)=>{
  if(signal.aborted){reject(new Error('ABORTED'));return;}
  const abort=()=>{clearTimeout(timer);reject(new Error('ABORTED'));};
  const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);signal.addEventListener('abort',abort,{once:true});
});

/** One explicit foreground download at a time. No startup/automatic retries. */
export class QuranDownloads {
  private index=new Map<string,OfflineEntry>();private plans:OfflineJob[]=[];private listeners=new Set<()=>void>();
  private loading:Promise<void>|null=null;private controller:AbortController|null=null;private work:Promise<void>|null=null;
  private editing=false;private resourceLists=new Map<string,OfflineResource[]>();
  private snapshot:DownloadSnapshot={ready:false,error:false,active:null,files:0,bytes:0,jobs:[]};
  private store:OfflineStore;
  private fetcher:(r:OfflineResource,signal:AbortSignal)=>Promise<{data:Uint8Array;mime:string}>;
  private delay:(signal:AbortSignal)=>Promise<void>;
  constructor(store:OfflineStore,fetcher:(r:OfflineResource,signal:AbortSignal)=>Promise<{data:Uint8Array;mime:string}>,delay:(signal:AbortSignal)=>Promise<void>=s=>sleep(1000,s)){this.store=store;this.fetcher=fetcher;this.delay=delay;}
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  getSnapshot=()=>this.snapshot;
  private resources(job:OfflineJob){let list=this.resourceLists.get(job.id);if(!list){list=offlineResources(job);this.resourceLists.set(job.id,list);}return list;}
  private emit(){
    this.snapshot={ready:true,error:false,active:this.controller?this.plans.find(j=>j.status==='running')?.id??null:null,files:this.index.size,bytes:[...this.index.values()].reduce((n,e)=>n+e.bytes,0),jobs:this.plans.map(j=>{
      const resources=this.resources(j),entries=resources.flatMap(r=>this.index.get(r.key)??[]);
      return {...j,done:entries.length,total:resources.length,bytes:entries.reduce((n,e)=>n+e.bytes,0)};
    })};this.listeners.forEach(f=>f());
  }
  init():Promise<void>{
    if(this.loading)return this.loading;
    this.loading=(async()=>{
      this.index=new Map((await this.store.entries()).map(e=>[e.key,e]));this.plans=[];
      for(const job of await this.store.jobs())try{
        const resources=offlineResources(job);if(job.id!==jobId(job))continue;
        const complete=resources.every(r=>this.index.has(r.key));
        this.plans.push({...job,status:complete?'complete':'paused',error:''});
      }catch{ /* An invalid manifest never becomes a filesystem path or request. */ }
      this.emit();
    })().catch(error=>{this.loading=null;this.snapshot={...this.snapshot,error:true};this.listeners.forEach(f=>f());throw error;});return this.loading;
  }
  async start(plan:OfflinePlan){
    const resources=offlineResources(plan);await this.init();if(this.work||this.editing)throw new Error('DOWNLOAD_BUSY');
    this.editing=true;
    const id=jobId(plan);let job=this.plans.find(j=>j.id===id);
    try{if(!job){job={...plan,id,status:'paused',error:''};await this.store.saveJob(job);this.plans.push(job);}}
    catch(error){this.editing=false;throw error;}
    const current=job,controller=new AbortController();this.controller=controller;current.status='running';current.error='';this.emit();
    this.work=(async()=>{
      try{
        for(const resource of resources){
          if(controller.signal.aborted)break;
          const old=this.index.get(resource.key);if(old&&await this.store.exists(old))continue;
          this.index.delete(resource.key);
          const result=await this.fetcher(resource,controller.signal);if(controller.signal.aborted)break;
          validateOfflineContent(resource,result.data,result.mime);
          await this.store.put(resource,result.data,result.mime);
          this.index.set(resource.key,{key:resource.key,bytes:result.data.length,mime:result.mime});this.emit();
          await this.delay(controller.signal);
        }
        current.status=controller.signal.aborted?'paused':'complete';
      }catch{current.status=controller.signal.aborted?'paused':'error';current.error=controller.signal.aborted?'':'DOWNLOAD_FAILED';}
      finally{
        if(resources.every(r=>this.index.has(r.key))){current.status='complete';current.error='';}
        this.controller=null;try{await this.store.saveJob(current);}catch{current.status='error';current.error='STORAGE_FAILED';}
        this.emit();this.work=null;
      }
    })();this.editing=false;
  }
  async pause(){this.controller?.abort();await this.work;}
  async remove(id:string){
    await this.init();if(this.work||this.editing)throw new Error('DOWNLOAD_BUSY');
    const job=this.plans.find(j=>j.id===id);if(!job)return;
    this.editing=true;job.status='paused';
    try{const retained=this.plans.filter(j=>j.id!==id),shared=new Set(retained.flatMap(j=>this.resources(j).map(r=>r.key)));
      for(const resource of this.resources(job))if(!shared.has(resource.key)){await this.store.remove(resource.key);this.index.delete(resource.key);}
      await this.store.deleteJob(id);this.plans=retained;this.resourceLists.delete(id);
    }finally{this.editing=false;this.emit();}
  }
  async uri(url:string):Promise<string|null>{return this.cached(url,'uri');}
  async text(url:string):Promise<string|null>{return this.cached(url,'text');}
  private async cached(url:string,kind:'uri'|'text'):Promise<string|null>{
    const resource=offlineResource(url);await this.init();const entry=this.index.get(resource.key);if(!entry)return null;
    if(!await this.store.exists(entry)){this.index.delete(entry.key);for(const job of this.plans)if(this.resources(job).some(r=>r.key===entry.key))job.status='paused';this.emit();return null;}
    return this.store[kind](entry);
  }
}
