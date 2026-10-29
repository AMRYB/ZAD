import {Platform} from 'react-native';
import {QuranDownloads,type OfflineResource} from '../core/offline-quran';
import {offlineStore} from './offline-store';
let nextRequest=0;
async function download(resource:OfflineResource,signal:AbortSignal){
  const controller=new AbortController(),abort=()=>controller.abort();
  signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();const timer=setTimeout(abort,60000);
  try{
    const wait=Math.max(0,nextRequest-Date.now());
    if(wait)await new Promise<void>((resolve,reject)=>{
      const cancel=()=>{clearTimeout(slot);reject(new Error('ABORTED'));};
      const slot=setTimeout(()=>{controller.signal.removeEventListener('abort',cancel);resolve();},wait);
      controller.signal.addEventListener('abort',cancel,{once:true});if(controller.signal.aborted)cancel();
    });
    if(controller.signal.aborted)throw new Error('ABORTED');nextRequest=Date.now()+1000;
    const url=Platform.OS==='web'?`/api/ksu-offline?url=${encodeURIComponent(resource.url)}`:resource.url;
    const response=await fetch(url,{signal:controller.signal,credentials:'omit',redirect:'error'});
    if(!response.ok||Platform.OS!=='web'&&response.url&&response.url!==resource.url)throw new Error('DOWNLOAD_HTTP');
    if(Number(response.headers.get('content-length'))>32*1024*1024)throw new Error('DOWNLOAD_SIZE');
    return {data:new Uint8Array(await response.arrayBuffer()),mime:response.headers.get('content-type')??'application/octet-stream'};
  }finally{clearTimeout(timer);signal.removeEventListener('abort',abort);}
}
export const quranDownloads=new QuranDownloads(offlineStore,download);
// Storage failure must not break existing online reading for users who have not downloaded.
export async function offlineUri(url:string){try{return await quranDownloads.uri(url);}catch{return null;}}
export async function offlineText(url:string){try{return await quranDownloads.text(url);}catch{return null;}}
