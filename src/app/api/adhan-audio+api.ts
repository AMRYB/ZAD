import {createHash} from 'node:crypto';
import {adhanAudioSha,adhanAudioUrl} from '../../services/adhan-audio';
let cached:Uint8Array|null=null;
let pending:Promise<Uint8Array>|null=null;
async function recording(){
  const response=await fetch(adhanAudioUrl,{headers:{Referer:'https://audio.islamweb.net/'},redirect:'error',signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error('AUDIO_UNAVAILABLE');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes.length>2000000||createHash('sha256').update(bytes).digest('hex')!==adhanAudioSha)throw new Error('AUDIO_CHANGED');
  return bytes;
}
export async function GET(){
  try{if(!cached){pending??=recording();cached=await pending;}return new Response(cached as BodyInit,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'public, max-age=86400'}});}
  catch{return Response.json({error:'AUDIO_UNAVAILABLE'},{status:502});}finally{pending=null;}
}
