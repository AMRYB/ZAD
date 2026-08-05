import {fetchOfficialMonth} from '../../services/esa-source';
import {esaCity} from '../../data/esa-cities';
import type {PrayerMonth} from '../../core/adhan';
const cache=new Map<string,PrayerMonth>();
const pending=new Map<string,Promise<PrayerMonth>>();
export async function GET(request:Request){
  const url=new URL(request.url);const city=url.searchParams.get('city')??'';const month=url.searchParams.get('month')??'';
  const currentYear=+new Intl.DateTimeFormat('en',{timeZone:'Africa/Cairo',year:'numeric'}).format(new Date());
  if([...url.searchParams.keys()].some(k=>!['city','month'].includes(k))||url.searchParams.getAll('city').length!==1||url.searchParams.getAll('month').length!==1||!esaCity(city)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||+month.slice(0,4)!==currentYear)return Response.json({error:'INVALID_CITY_OR_MONTH'},{status:400});
  const key=`${city}:${month}`;const found=cache.get(key);
  if(found&&Date.now()-found.fetchedAt<86400000)return Response.json(found);
  if(pending.size>=3&&!pending.has(key))return Response.json({error:'BUSY'},{status:429});
  try{
    let task=pending.get(key);
    if(!task){task=fetchOfficialMonth(city,month);pending.set(key,task);}
    const result=await task;
    if(cache.size>=96)cache.delete(cache.keys().next().value!);cache.set(key,result);
    return Response.json(result,{headers:{'Cache-Control':'private, max-age=900'}});
  }catch{return Response.json({error:'ESA_UNAVAILABLE'},{status:502});}
  finally{pending.delete(key);}
}
