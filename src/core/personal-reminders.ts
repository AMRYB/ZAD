import type {DevotionState} from './devotion.ts';
export function personalReminders(state:DevotionState){
  const entries:{id:string;time:string}[]=[];
  if(state.reminders.adhkar.enabled)state.reminders.adhkar.times.forEach((time,i)=>entries.push({id:['adhkar-morning','adhkar-evening','adhkar-sleep'][i],time}));
  if(state.reminders.deeds.enabled&&state.deeds.selected.length)state.reminders.deeds.times.forEach((time,i)=>entries.push({id:`deeds-${i}`,time}));
  return entries;
}
