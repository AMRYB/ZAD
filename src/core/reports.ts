import {addDays,parseDate} from './calendar.ts';
import {adhkarEntries} from './adhkar.ts';
import type {State} from './model.ts';
const repeats=new Map(adhkarEntries.map(e=>[e.id,e.repeat]));
export function activityReport(state:State,end:string,length:7|30){
  parseDate(end);if(length!==7&&length!==30)throw new Error('INVALID_REPORT_RANGE');
  const reading=new Map<string,number>();
  for(const e of state.gamification.events)if(e.kind==='reading'&&e.active)reading.set(e.date,(reading.get(e.date)??0)+1);
  const days=Array.from({length},(_,i)=>{
    const date=addDays(end,i-length+1),record=state.days[date];
    let adhkar=0;
    for(const [session,entries] of Object.entries(state.devotion.adhkar.counts))if(session.startsWith(date+':'))
      for(const [id,count] of Object.entries(entries))if(count>0&&count===(repeats.get(id)??Infinity))adhkar++;
    const prayers=Object.values(record?.prayers??{}).filter(s=>s==='completed').length;
    const fast=record?.fast==='fasted'?1:0;
    const habits=state.habits.filter(h=>h.dates.includes(date)).length;
    const deeds=state.devotion.deeds.days[date]?.length??0,tasbih=state.devotion.tasbih.daily[date]??0,pages=reading.get(date)??0;
    const logged=!!record&&(record.fast!=='unlogged'||Object.values(record.prayers).some(s=>s!=='unlogged'));
    return {date,prayers,fast,habits,deeds,tasbih,adhkar,pages,active:logged||prayers+fast+habits+deeds+tasbih+adhkar+pages>0};
  });
  const sum=(key:'prayers'|'fast'|'habits'|'deeds'|'tasbih'|'adhkar'|'pages')=>days.reduce((n,d)=>n+d[key],0);
  return {days,activeDays:days.filter(d=>d.active).length,prayers:sum('prayers'),fasts:sum('fast'),habits:sum('habits'),deeds:sum('deeds'),tasbih:sum('tasbih'),adhkar:sum('adhkar'),pages:sum('pages')};
}
