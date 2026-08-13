import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reducer,restoreState} from '../src/core/model.ts';
import {ProfileStore,newProfile,stageProfile,cloudDocument,applyCloud,mergeGuest,syncProfile,type SyncTransport} from '../src/core/cloud.ts';
import {cloudTransport} from '../src/core/cloud-transport.ts';
import {authCallbackCode,authCallbackFlow} from '../src/core/auth-callback.ts';
const A='90000000-0000-4000-8000-000000000001',B='90000000-0000-4000-8000-000000000002';
function memory(){const values=new Map<string,string>();const storage={read:async(id:string)=>values.get(id)??null,write:async(id:string,text:string)=>{values.set(id,text);}};return {storage,values,store:new ProfileStore(storage)};}
const note=(text:string)=>reducer(initialState(),{type:'note',date:'2026-10-25',text});
test('profiles isolate guest/account data and fail closed on corrupt storage or invalid owner',async()=>{
  const {store,values}=memory();await store.ensure(A,note('Only A'));await store.ensure(B,note('Only B'));
  assert.equal((await store.get(A)).state.days['2026-10-25'].note,'Only A');assert.equal((await store.get(B)).state.days['2026-10-25'].note,'Only B');
  assert.throws(()=>store.get('../guest'));values.set(A,'{}');await assert.rejects(()=>store.get(A),/INVALID_PROFILE/);
});
test('cloud documents preserve private records but cannot turn on alarms or overwrite device preferences',()=>{
  const local=initialState();local.theme='dark';local.adhan={city:'القـاهـرة',enabled:true,reminder:true};local.devotion.reminders.adhkar.enabled=true;
  const remote=note('Private note');const document=cloudDocument(local),copy=restoreState(document);
  assert.equal(copy.adhan.enabled,false);assert.equal(copy.devotion.reminders.adhkar.enabled,false);
  const merged=applyCloud(local,remote);assert.equal(merged.theme,'dark');assert.equal(merged.adhan.enabled,true);assert.equal(merged.days['2026-10-25'].note,'Private note');
  assert.equal(cloudDocument(merged),cloudDocument(remote));
});
test('durable outbox survives restart and an acknowledgement cannot discard a newer edit',async()=>{
  const {store,storage}=memory();await store.update(A,p=>stageProfile({...p,enabled:true},note('First')));
  let begin!:()=>void,release!:()=>void;const started=new Promise<void>(r=>{begin=r;}),waiting=new Promise<void>(r=>{release=r;});
  const api:SyncTransport={head:async()=>0,read:async()=>null,write:async()=>{begin();await waiting;return 1;}};
  const job=syncProfile(store,A,api);await started;await store.update(A,p=>stageProfile(p,note('Newer')));release();assert.deepEqual(await job,{kind:'queued'});
  const restarted=new ProfileStore(storage),p=await restarted.get(A);assert.equal(p.revision,1);assert.ok(p.pending?.includes('Newer'));
  assert.deepEqual(await syncProfile(restarted,A,{head:async()=>1,read:async()=>null,write:async expected=>{assert.equal(expected,1);return 2;}}),{kind:'synced'});
  assert.equal((await restarted.get(A)).pending,null);
});
test('conflicting remote data is surfaced without replacing local data and disabled sync does no network IO',async()=>{
  const {store}=memory();await store.ensure(A,note('Local'));let calls=0;const remote=note('Remote');
  const api:SyncTransport={head:async()=>{calls++;return 1;},read:async()=>({revision:1,payload:remote}),write:async()=>{throw new Error('Unexpected write');}};
  assert.deepEqual(await syncProfile(store,A,api),{kind:'disabled'});assert.equal(calls,0);
  await store.update(A,p=>stageProfile({...p,enabled:true},p.state));assert.equal((await syncProfile(store,A,api)).kind,'conflict');assert.equal((await store.get(A)).state.days['2026-10-25'].note,'Local');
});
test('lost acknowledgements are recognized by the saved document without another upload',async()=>{
  const {store}=memory(),state=note('Saved remotely');await store.update(A,p=>stageProfile({...p,enabled:true},state));
  assert.deepEqual(await syncProfile(store,A,{head:async()=>1,read:async()=>({revision:1,payload:state}),write:async()=>{throw new Error('Duplicate upload');}}),{kind:'synced'});
  assert.equal((await store.get(A)).revision,1);assert.equal((await store.get(A)).pending,null);
});
test('guest import adds new records once and respects XP caps and account collision choices',()=>{
  let account=note('Account note'),guest=note('Guest note');
  for(let i=0;i<8;i++){account=reducer(account,{type:'habitAdd',id:`a${i}`,title:'A'});account=reducer(account,{type:'habitToggle',id:`a${i}`,date:'2026-10-25'},'2026-10-25');guest=reducer(guest,{type:'habitAdd',id:`b${i}`,title:'B'});guest=reducer(guest,{type:'habitToggle',id:`b${i}`,date:'2026-10-25'},'2026-10-25');}
  guest=reducer(guest,{type:'bookmark',sura:2,aya:1});const merged=mergeGuest(account,guest);
  assert.equal(merged.days['2026-10-25'].note,'Account note');assert.equal(merged.habits.length,16);assert.deepEqual(mergeGuest(merged,guest),merged);
  assert.equal(merged.gamification.events.reduce((n,e)=>n+e.points,0),15);assert.deepEqual(restoreState(JSON.stringify(merged)),merged);assert.deepEqual(merged.bookmarks,[{sura:2,aya:1}]);
});
test('account updates preserve complete conflict archives across serialized restart',async()=>{
  const {store,storage}=memory();const state=note('Keep this version');await store.ensure(A,state);
  await store.update(A,p=>stageProfile({...p,archives:[{at:'2026-10-25T00:00:00Z',reason:'before-replace',state:p.state}]},note('Replacement')));
  const restored=await new ProfileStore(storage).get(A);assert.equal(restored.archives[0].state.days['2026-10-25'].note,'Keep this version');assert.equal(restored.state.days['2026-10-25'].note,'Replacement');assert.equal(newProfile().enabled,false);
});
test('HTTP requests retain their captured identity across account switching, including account deletion',async()=>{
  const calls:{url:string;headers:Headers;body:string}[]=[];const identity={id:A,token:'synthetic-A'};
  const request:typeof fetch=async(url,init)=>{calls.push({url:String(url),headers:new Headers(init?.headers),body:String(init?.body??'')});return new Response(String(url).includes('/rpc/sync_state')?'1':String(url).includes('/rpc/delete_my_account')?'null':'[]',{status:200,headers:{'Content-Type':'application/json'}});};
  const transport=cloudTransport({url:'https://synthetic.supabase.co',key:'sb_publishable_synthetic'},identity,undefined,request);
  identity.id=B;identity.token='synthetic-B';await transport.head();await transport.write(0,cloudDocument(initialState()));await transport.deleteAccount();
  assert.ok(calls[0].url.includes(A));assert.ok(calls.every(c=>c.headers.get('Authorization')==='Bearer synthetic-A'));
  assert.equal(JSON.parse(calls[1].body).p_expected_revision,0);assert.ok(calls[2].url.endsWith('/rpc/delete_my_account'));
  assert.throws(()=>cloudTransport({url:'https://unrelated.example',key:'sb_publishable_synthetic'},identity));
});
test('auth callbacks allow only the owned native/web route and reject implicit tokens or duplicate codes',()=>{
  const code='synthetic-code-123';assert.equal(authCallbackCode(`ramadanjourney://auth/callback?code=${code}`),code);
  assert.equal(authCallbackCode(`http://localhost:8082/auth/callback?code=${code}`,'http://localhost:8082'),code);
  for(const url of [`https://unrelated.example/auth/callback?code=${code}`,`ramadanjourney://other/callback?code=${code}`,`ramadanjourney://auth/callback?code=${code}&code=another-code`,`ramadanjourney://auth/callback#access_token=synthetic`])assert.equal(authCallbackCode(url,'http://localhost:8082'),null);
  assert.equal(authCallbackFlow('ramadanjourney://auth/callback?sb_flow_id=synthetic-flow-123'),'synthetic-flow-123');
  assert.equal(authCallbackFlow('ramadanjourney://auth/callback?sb_flow_id=../../other'),undefined);
});
