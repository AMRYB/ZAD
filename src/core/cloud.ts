import {initialState,restoreState,type State} from './model.ts';
import {DAILY_XP_CAP,xpRules,participationStillRecorded,type XpEvent} from './gamification.ts';
export interface Archive {at:string;reason:string;state:State}
export interface Profile {version:1;state:State;revision:number;synced:string|null;pending:string|null;enabled:boolean;lastSync:string|null;guestReceipt:string|null;archives:Archive[]}
export function newProfile(state:State=initialState()):Profile{return {version:1,state,revision:0,synced:null,pending:null,enabled:false,lastSync:null,guestReceipt:null,archives:[]};}
/** Device alarms, appearance, reciter and haptics never enable themselves on another device. */
export function cloudDocument(state:State):string{
  const defaults=initialState();
  return JSON.stringify({...state,onboarded:true,locale:'ar',theme:'system',reader:defaults.reader,adhan:defaults.adhan,devotion:{...state.devotion,tasbih:{...state.devotion.tasbih,haptics:true},reminders:defaults.devotion.reminders}} satisfies State);
}
export function applyCloud(local:State,remote:State):State{return {...remote,onboarded:true,locale:local.locale,theme:local.theme,reader:local.reader,adhan:local.adhan,devotion:{...remote.devotion,tasbih:{...remote.devotion.tasbih,haptics:local.devotion.tasbih.haptics},reminders:local.devotion.reminders}};}
export function parseProfile(text:string):Profile{
  const v=JSON.parse(text) as Profile;
  if(!v||v.version!==1||!Number.isSafeInteger(v.revision)||v.revision<0||typeof v.enabled!=='boolean'||!Array.isArray(v.archives)||v.lastSync!==null&&typeof v.lastSync!=='string'||v.guestReceipt!==null&&typeof v.guestReceipt!=='string')throw new Error('INVALID_PROFILE');
  v.state=restoreState(JSON.stringify(v.state));
  for(const doc of [v.synced,v.pending])if(doc!==null){if(typeof doc!=='string')throw new Error('INVALID_PROFILE');restoreState(doc);}
  for(const a of v.archives){if(!a||typeof a.at!=='string'||typeof a.reason!=='string')throw new Error('INVALID_PROFILE');a.state=restoreState(JSON.stringify(a.state));}
  return v;
}
export function stageProfile(profile:Profile,state:State):Profile{const document=cloudDocument(state);return {...profile,state,pending:document===profile.synced?null:document};}
export function acknowledge(profile:Profile,sent:string,revision:number,at:string):Profile{
  if(revision<profile.revision)return profile;
  return {...profile,revision,synced:sent,lastSync:at,pending:profile.pending===sent?null:profile.pending};
}
export function hasRecords(s:State){return Object.keys(s.days).length>0||s.goals.length>0||s.plans.length>0||s.habits.length>0||s.bookmarks.length>0||s.devotion.adhkar.favorites.length>0||Object.keys(s.devotion.tasbih.daily).length>0||Object.keys(s.devotion.deeds.days).length>0||s.devotion.deeds.custom.length>0||Object.keys(s.devotion.adhkar.counts).length>0||s.lastRead.sura!==1||s.lastRead.aya!==1;}
/** Merge new entities only; conflicting originals remain available in local archives. */
export function mergeGuest(account:State,guest:State):State{
  const entities=<T extends {id:string}>(a:T[],b:T[])=>[...a,...b.filter(v=>!a.some(x=>x.id===v.id))];
  const mergeDays={...guest.days,...account.days};
  const raw=[...account.gamification.events,...guest.gamification.events.filter(e=>!account.gamification.events.some(a=>a.kind===e.kind&&a.source===e.source))];
  const events:XpEvent[]=[],totals=new Map<string,number>(),caps=new Map<string,number>();
  for(const e of raw){const rule=xpRules.find(r=>r.kind===e.kind)!;const key=JSON.stringify([e.date,e.kind]);const points=Math.max(0,Math.min(rule.points,DAILY_XP_CAP-(totals.get(e.date)??0),rule.cap-(caps.get(key)??0)));events.push({...e,points});totals.set(e.date,(totals.get(e.date)??0)+points);caps.set(key,(caps.get(key)??0)+points);}
  const devotion={...account.devotion,
    tasbih:{...account.devotion.tasbih,daily:{...guest.devotion.tasbih.daily,...account.devotion.tasbih.daily},counts:Object.fromEntries(Object.entries(account.devotion.tasbih.counts).map(([key,n])=>[key,Math.max(n,guest.devotion.tasbih.counts[key as keyof typeof guest.devotion.tasbih.counts])])) as typeof account.devotion.tasbih.counts},
    adhkar:{...account.devotion.adhkar,counts:{...guest.devotion.adhkar.counts,...account.devotion.adhkar.counts},favorites:[...new Set([...account.devotion.adhkar.favorites,...guest.devotion.adhkar.favorites])],last:{...guest.devotion.adhkar.last,...account.devotion.adhkar.last}},
    deeds:{...account.devotion.deeds,custom:entities(account.devotion.deeds.custom,guest.devotion.deeds.custom),days:{...guest.devotion.deeds.days,...account.devotion.deeds.days},selected:[...new Set([...account.devotion.deeds.selected,...guest.devotion.deeds.selected])]},
  };
  devotion.deeds.selected=devotion.deeds.selected.filter(id=>!devotion.deeds.custom.some(d=>d.id===id&&d.archived));
  const merged={...account,days:mergeDays,goals:entities(account.goals,guest.goals),plans:entities(account.plans,guest.plans),habits:entities(account.habits,guest.habits),bookmarks:[...account.bookmarks,...guest.bookmarks.filter(b=>!account.bookmarks.some(a=>a.sura===b.sura&&a.aya===b.aya))],lastRead:hasRecords(account)?account.lastRead:guest.lastRead,devotion,gamification:{ruleVersion:1 as const,events}};
  merged.gamification.events=merged.gamification.events.map(e=>account.gamification.events.some(a=>a.kind===e.kind&&a.source===e.source)?e:{...e,active:e.active&&participationStillRecorded(merged,e)});
  return restoreState(JSON.stringify(merged));
}
export function profileOwner(id:string){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new Error('INVALID_OWNER');return id;}
export interface ProfileStorage {read:(owner:string)=>Promise<string|null>;write:(owner:string,value:string)=>Promise<void>}
export class ProfileStore {
  private queue:Promise<unknown>=Promise.resolve();
  private storage:ProfileStorage;
  constructor(storage:ProfileStorage){this.storage=storage;}
  private serial<T>(work:()=>Promise<T>):Promise<T>{const next=this.queue.catch(()=>{}).then(work);this.queue=next;return next;}
  get(owner:string,defaults=initialState()):Promise<Profile>{profileOwner(owner);return this.serial(async()=>{const text=await this.storage.read(owner);return text?parseProfile(text):newProfile(defaults);});}
  ensure(owner:string,defaults:State):Promise<Profile>{profileOwner(owner);return this.serial(async()=>{const text=await this.storage.read(owner);if(text)return parseProfile(text);const p=newProfile(defaults);await this.storage.write(owner,JSON.stringify(p));return p;});}
  update(owner:string,mutate:(current:Profile)=>Profile,defaults=initialState()):Promise<Profile>{profileOwner(owner);return this.serial(async()=>{const text=await this.storage.read(owner);const next=mutate(text?parseProfile(text):newProfile(defaults));const valid=parseProfile(JSON.stringify(next));await this.storage.write(owner,JSON.stringify(valid));return valid;});}
}
export interface RemoteSnapshot {revision:number;payload:State}
export interface SyncTransport {head:()=>Promise<number>;read:()=>Promise<RemoteSnapshot|null>;write:(expected:number,document:string)=>Promise<number>}
export type SyncResult={kind:'disabled'|'synced'|'queued'}|{kind:'remote'|'conflict';remote:RemoteSnapshot};
export async function syncProfile(store:ProfileStore,owner:string,api:SyncTransport):Promise<SyncResult>{
  const local=await store.get(owner);if(!local.enabled)return {kind:'disabled'};
  const revision=await api.head();
  if(revision!==local.revision){
    const remote=await api.read();if(!remote)throw new Error('CLOUD_CHANGED');
    const document=cloudDocument(remote.payload);
    if(local.pending===document){await store.update(owner,p=>acknowledge(p,local.pending!,remote.revision,new Date().toISOString()));return {kind:'synced'};}
    return {kind:local.pending?'conflict':'remote',remote};
  }
  if(!local.pending)return {kind:'synced'};
  const next=await api.write(local.revision,local.pending);
  const saved=await store.update(owner,p=>acknowledge(p,local.pending!,next,new Date().toISOString()));
  return {kind:saved.pending?'queued':'synced'};
}
