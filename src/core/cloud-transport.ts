import {restoreState} from './model.ts';
import {profileOwner,type SyncTransport,type RemoteSnapshot} from './cloud.ts';
export function cloudTransport(config:{url:string;key:string},identity:{id:string;token:string},signal?:AbortSignal,request:typeof fetch=fetch):SyncTransport&{deleteAccount:()=>Promise<void>}{
  const id=profileOwner(identity.id),token=identity.token;const origin=new URL(config.url);
  if(origin.protocol!=='https:'||!origin.hostname.endsWith('.supabase.co')||!config.key.startsWith('sb_publishable_'))throw new Error('INVALID_CLOUD_CONFIG');
  const headers={'apikey':config.key,'Authorization':`Bearer ${token}`,'Content-Type':'application/json'};
  const run=async(path:string,body?:unknown)=>{
    const controller=new AbortController();const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)controller.abort();
    const timer=setTimeout(abort,15000);
    try{
      const result=await request(new URL(path,origin),{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,credentials:'omit',redirect:'error'});
      if(!result.ok){const data=await result.json().catch(()=>null);throw new Error(result.status===401?'AUTH_REQUIRED':data?.code==='40001'?'SYNC_CONFLICT':'CLOUD_UNAVAILABLE');}
      return await result.json();
    }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  };
  const path=(fields:string)=>`/rest/v1/user_snapshots?${new URLSearchParams({select:fields,user_id:`eq.${id}`,limit:'1'})}`;
  return {
    head:async()=>{const rows=await run(path('revision'));const n=rows[0]?.revision??0;if(!Number.isSafeInteger(n)||n<0)throw new Error('INVALID_REMOTE');return n;},
    read:async():Promise<RemoteSnapshot|null>=>{const rows=await run(path('revision,payload'));if(!rows.length)return null;const row=rows[0];if(!Number.isSafeInteger(row.revision)||row.revision<1)throw new Error('INVALID_REMOTE');return {revision:row.revision,payload:restoreState(JSON.stringify(row.payload))};},
    write:async(expected,document)=>{const n=await run('/rest/v1/rpc/sync_state',{p_expected_revision:expected,p_payload:JSON.parse(document)});if(!Number.isSafeInteger(n)||n<=expected)throw new Error('INVALID_REMOTE');return n;},
    deleteAccount:async()=>{await run('/rest/v1/rpc/delete_my_account',{});},
  };
}
