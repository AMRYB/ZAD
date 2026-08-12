import {cairoTimestamp,prayerKeys,type PrayerMonth} from './adhan.ts';
import {dateInZone,addDays} from './calendar.ts';
export function nextPrayer(months:PrayerMonth[],city:string,now:number){
  if(!Number.isFinite(now))throw new Error('INVALID_CLOCK');
  let next:{date:string;prayer:Exclude<typeof prayerKeys[number],'sunrise'>;at:number;time:string}|null=null;
  const today=dateInZone(new Date(now),'Africa/Cairo'),tomorrow=addDays(today,1);
  for(const m of months){if(m.city!==city)continue;for(const day of m.days){if(day.date!==today&&day.date!==tomorrow)continue;for(const prayer of prayerKeys){
    if(prayer==='sunrise')continue;
    const at=cairoTimestamp(day.date,day.times[prayer]);
    if(at>now&&(!next||at<next.at))next={date:day.date,prayer,at,time:day.times[prayer]};
  }}}
  return next;
}
export function countdown(at:number,now:number){const n=Math.max(0,Math.ceil((at-now)/1000));return `${String(Math.floor(n/3600)).padStart(2,'0')}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
