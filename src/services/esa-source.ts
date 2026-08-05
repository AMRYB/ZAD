import {ESA_MONTH_URL,esaForm,parseEsaMonth} from '../core/adhan.ts';

// Fixed official destination; form state lives only for this request and is never logged.
export async function fetchOfficialMonth(city:string,month:string,signal?:AbortSignal){
  const abort=AbortSignal.any([AbortSignal.timeout(25000),...(signal?[signal]:[])]);
  const headers={'User-Agent':'Mozilla/5.0 (compatible; ZAD prayer timetable reader)','Accept':'text/html'};
  const first=await fetch(ESA_MONTH_URL,{headers,signal:abort,redirect:'error',credentials:'omit'});
  if(!first.ok)throw new Error(`ESA_HTTP_${first.status}`);
  const formHtml=await first.text();if(formHtml.length>1000000)throw new Error('ESA_RESPONSE_TOO_LARGE');
  const response=await fetch(ESA_MONTH_URL,{method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded','Referer':ESA_MONTH_URL},body:esaForm(formHtml,city,month).toString(),signal:abort,redirect:'error',credentials:'omit'});
  if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw new Error(`ESA_HTTP_${response.status}`);
  const html=await response.text();if(html.length>1000000)throw new Error('ESA_RESPONSE_TOO_LARGE');
  return parseEsaMonth(html,city,month);
}
