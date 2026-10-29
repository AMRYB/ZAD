import {cairoTimestamp,prayerKeys,type PrayerDay,type TimeKey} from './adhan.ts';
export const prayerNames:Record<TimeKey,[string,string]>={fajr:['الفجر','Fajr'],sunrise:['الشروق','Sunrise'],dhuhr:['الظهر','Dhuhr'],asr:['العصر','Asr'],maghrib:['المغرب','Maghrib'],isha:['العشاء','Isha']};
export function displayPrayerTime(value:string,locale:string){return new Intl.DateTimeFormat(locale,{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'UTC'}).format(new Date(`2000-01-01T${value}:00Z`));}
export function prayerTimeline(day:PrayerDay,now:number,following?:PrayerDay){
  const entries=prayerKeys.map(key=>({key,at:cairoTimestamp(day.date,day.times[key])}));
  const next=[...entries,...(following?[{key:'fajr' as const,at:cairoTimestamp(following.date,following.times.fajr)}]:[])].find(e=>e.key!=='sunrise'&&e.at>now);
  const start=entries[0].at,end=entries[5].at;
  return {entries,next,progress:Math.max(0,Math.min(1,(now-start)/(end-start))),start,end};
}
export function remainingTime(ms:number){const minutes=Math.max(0,Math.ceil(ms/60000));return `${Math.floor(minutes/60)}:${String(minutes%60).padStart(2,'0')}`;}
/** Physical left-to-right arch, independent of text direction. */
export function prayerArcPoint(progress:number,width:number,height:number){const theta=Math.PI*(1-Math.max(0,Math.min(1,progress)));return {x:width/2+width/2*Math.cos(theta),y:height-height*Math.sin(theta)};}
