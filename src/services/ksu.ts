import {Platform} from 'react-native';
import {BASE} from '../core/ksu';
// Native uses KSU directly. Browsers require the same-origin, allowlisted relay
// because KSU does not send Access-Control-Allow-Origin on interface.php.
export async function readKsuText(url:string,signal:AbortSignal):Promise<string>{
  const source=new URL(url);if(source.origin!==BASE||source.pathname!=='/interface.php')throw new Error('KSU_ONLY');
  const controller=new AbortController();const abort=()=>controller.abort();
  signal.addEventListener('abort',abort,{once:true});if(signal.aborted)controller.abort();
  const timeout=setTimeout(abort,15000);
  try{
    const target=Platform.OS==='web'?`/api/ksu${source.search}`:url;
    const response=await fetch(target,{signal:controller.signal,credentials:'omit'});
    if(!response.ok)throw new Error(`KSU_HTTP_${response.status}`);
    return await response.text();
  }finally{clearTimeout(timeout);signal.removeEventListener('abort',abort);}
}
