import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {adhanClips,clipId,type ClipId} from '../../core/adhan-sequence';
const cache=new Map<ClipId,Uint8Array>();
const pending=new Map<ClipId,Promise<Uint8Array>>();
async function recording(id:ClipId){
  const clip=adhanClips[id];
  const bytes=new Uint8Array(await readFile(path.join(process.cwd(),'assets','private','adhan',id+'.mp3')));
  if(bytes.length!==clip.bytes||createHash('sha256').update(bytes).digest('hex')!==clip.sha256)throw new Error('AUDIO_CHANGED');
  return bytes;
}
export async function GET(request:Request){
  const params=new URL(request.url).searchParams;
  if([...params.keys()].some(key=>key!=='clip')||params.getAll('clip').length!==1)return Response.json({error:'INVALID_AUDIO_CLIP'},{status:400});
  const id=clipId(params.get('clip'));
  if(!id)return Response.json({error:'INVALID_AUDIO_CLIP'},{status:400});
  try{
    if(!cache.has(id)){if(!pending.has(id))pending.set(id,recording(id));cache.set(id,await pending.get(id)!);}
    return new Response(cache.get(id)! as BodyInit,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400'}});
  }catch{return Response.json({error:'AUDIO_UNAVAILABLE'},{status:503});}finally{pending.delete(id);}
}
