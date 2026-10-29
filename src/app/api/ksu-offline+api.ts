import {offlineResource} from '../../core/offline-quran';
let active=0,nextStart=0;
/** Browser-only CORS relay; exact KSU allowlist, no arbitrary upstream URLs/cookies. */
export async function GET(request:Request){
  const params=new URL(request.url).searchParams;
  let target:string;try{if([...params.keys()].join()!=='url')throw new Error();target=offlineResource(params.get('url')??'').url;}catch{return new Response('Invalid download',{status:400});}
  if(active>=2||Date.now()<nextStart)return new Response('Retry later',{status:429,headers:{'Retry-After':'1'}});
  active++;nextStart=Date.now()+1000;
  try{
    const response=await fetch(target,{signal:AbortSignal.any([request.signal,AbortSignal.timeout(60000)]),redirect:'error',credentials:'omit'});
    if(!response.ok||Number(response.headers.get('content-length'))>32*1024*1024)throw new Error();
    const bytes=await response.arrayBuffer();if(bytes.byteLength>32*1024*1024)throw new Error();
    return new Response(bytes,{headers:{'Content-Type':response.headers.get('content-type')??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return new Response('Download unavailable',{status:502});}finally{active--;}
}
