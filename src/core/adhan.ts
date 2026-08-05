import {normalizeDigits,parseDate} from './calendar.ts';
import {esaCity} from '../data/esa-cities.ts';

export const ESA_MONTH_URL='https://www.esa.gov.eg/monthlymwaket.aspx';
export const prayerKeys=['fajr','sunrise','dhuhr','asr','maghrib','isha'] as const;
export type TimeKey=typeof prayerKeys[number];
export interface PrayerDay {date:string;hijri:string;times:Record<TimeKey,string>}
export interface PrayerMonth {city:string;month:string;days:PrayerDay[];fetchedAt:number;source:typeof ESA_MONTH_URL}
export interface AdhanPreferences {city:string|null;enabled:boolean;reminder:boolean}
export const defaultAdhan:AdhanPreferences={city:null,enabled:false,reminder:true};
export function validAdhan(value:unknown):value is AdhanPreferences {
  if(!value||typeof value!=='object')return false;
  const v=value as AdhanPreferences;
  return (v.city===null||!!esaCity(v.city))&&typeof v.enabled==='boolean'&&typeof v.reminder==='boolean'&&(!v.enabled||v.city!==null);
}
export function htmlText(value:string):string {
  return value.replace(/<[^>]*>/g,'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n:string)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n)))
    .replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
}
export function esaTime(text:string):string {
  const m=/^(\d{1,2}):(\d{1,2})\s*([صم])$/.exec(normalizeDigits(text));
  if(!m||+m[1]<1||+m[1]>12||+m[2]>59)throw new Error('ESA_INVALID_TIME');
  return `${String(+m[1]%12+(m[3]==='م'?12:0)).padStart(2,'0')}:${m[2].padStart(2,'0')}`;
}
export function parseEsaMonth(html:string,city:string,month:string,fetchedAt=Date.now()):PrayerMonth {
  const selected=esaCity(city);if(!selected||!/^\d{4}-\d{2}$/.test(month))throw new Error('ESA_INVALID_REQUEST');
  parseDate(`${month}-01`);
  const table=/<table\b[^>]*id="placeholder1_GridView1"[^>]*>([\s\S]*?)<\/table>/i.exec(html)?.[1];
  if(!table)throw new Error('ESA_NO_TABLE');
  const days:PrayerDay[]=[];
  for(const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(c=>htmlText(c[1]));
    if(cells.length!==9||!/^(\d{4}-\d{2}-\d{2})$/.test(cells[1]))continue;
    if(cells[0].replace(/ـ/g,'').trim()!==selected.name||!cells[1].startsWith(`${month}-`))throw new Error('ESA_WRONG_CITY_OR_MONTH');
    parseDate(cells[1]);
    const times=Object.fromEntries(prayerKeys.map((key,i)=>[key,esaTime(cells[i+3])])) as Record<TimeKey,string>;
    if(prayerKeys.some((key,i)=>i>0&&times[key]<=times[prayerKeys[i-1]]))throw new Error('ESA_INVALID_ORDER');
    days.push({date:cells[1],hijri:cells[2],times});
  }
  const expected=new Date(Date.UTC(+month.slice(0,4),+month.slice(5),0)).getUTCDate();
  if(days.length!==expected||new Set(days.map(d=>d.date)).size!==expected)throw new Error('ESA_INCOMPLETE_MONTH');
  return {city,month,days:days.sort((a,b)=>a.date.localeCompare(b.date)),fetchedAt,source:ESA_MONTH_URL};
}
export function esaForm(html:string,city:string,month:string):URLSearchParams {
  if(!esaCity(city)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('ESA_INVALID_REQUEST');
  const form=new URLSearchParams();
  for(const tag of html.matchAll(/<input\b[^>]*>/gi)){
    const name=/\bname="([^"]+)"/.exec(tag[0])?.[1];
    const value=/\bvalue="([^"]*)"/.exec(tag[0])?.[1]??'';
    if(name&&/^__(?:EVENTTARGET|EVENTARGUMENT|LASTFOCUS|VIEWSTATE\d*|VIEWSTATEFIELDCOUNT|VIEWSTATEGENERATOR|EVENTVALIDATION)$/.test(name))form.set(name,htmlText(value));
  }
  if(!form.has('__VIEWSTATE')||!form.has('__EVENTVALIDATION'))throw new Error('ESA_FORM_CHANGED');
  form.set('__EVENTTARGET','ctl00$placeholder1$DropDownList2');form.set('__EVENTARGUMENT','');
  form.set('ctl00$placeholder1$DropDownList1',city);form.set('ctl00$placeholder1$DropDownList2',String(+month.slice(5)));
  return form;
}
const cairoFormatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function cairoTimestamp(date:string,time:string):number {
  parseDate(date);if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('INVALID_TIME');
  const wall=Date.parse(`${date}T${time}:00Z`);let instant=wall;
  for(let i=0;i<3;i++){
    const parts=cairoFormatter.formatToParts(new Date(instant));const part=(n:string)=>parts.find(p=>p.type===n)!.value;
    const represented=Date.parse(`${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:00Z`);
    const delta=wall-represented;if(!delta)return instant;instant+=delta;
  }
  throw new Error('NONEXISTENT_CAIRO_TIME');
}
export function prayerEvents(months:PrayerMonth[],now:number,reminder:boolean){
  const events=new Map<string,{id:string;at:number;prayer:TimeKey;reminder:boolean}>();
  for(const month of months)for(const day of month.days)for(const prayer of prayerKeys){
    if(prayer==='sunrise')continue;
    const at=cairoTimestamp(day.date,day.times[prayer]);const id=`${month.city}:${day.date}:${prayer}`;
    if(at>now)events.set(id,{id,at,prayer,reminder:false});
    if(reminder&&at-600000>now)events.set(`${id}:reminder`,{id:`${id}:reminder`,at:at-600000,prayer,reminder:true});
  }
  return [...events.values()].sort((a,b)=>a.at-b.at);
}
