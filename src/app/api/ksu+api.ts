import {relayTarget} from '../../core/ksu-relay';
const cache=new Map<string,{text:string;type:string;expires:number}>();
const pending=new Map<string,Promise<{text:string;type:string;expires:number}>>();
export async function GET(request:Request){
  let target:string;try{target=relayTarget(new URL(request.url).searchParams);}catch{return new Response('Invalid KSU request',{status:400});}
  const hit=cache.get(target);if(hit&&hit.expires>Date.now())return result(hit);
  if(!pending.has(target)&&pending.size>=4)return new Response('Retry shortly',{status:429,headers:{'Retry-After':'3'}});
  try{
    let promise=pending.get(target);
    if(!promise){
      promise=(async()=>{
        const r=await fetch(target,{signal:AbortSignal.timeout(15000),redirect:'error'});
        if(!r.ok)throw new Error('KSU_UPSTREAM');
        const text=await r.text();if(text.length>524288)throw new Error('KSU_TOO_LARGE');
        const value={text,type:r.headers.get('content-type')??'text/plain; charset=utf-8',expires:Date.now()+300000};
        cache.set(target,value);if(cache.size>128)cache.delete(cache.keys().next().value!);return value;
      })();pending.set(target,promise);
    }
    const value=await promise;return result(value);
  }catch{return new Response('KSU resource unavailable',{status:502});}
  finally{pending.delete(target);}
}
function result(value:{text:string;type:string}){return new Response(value.text,{headers:{'Content-Type':value.type,'Cache-Control':'public, max-age=300','X-Content-Source':'https://quran.ksu.edu.sa','X-Content-Type-Options':'nosniff'}});}
