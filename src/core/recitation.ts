import {quran} from '../data/quran.ts';
import {recitationUrl} from './ksu.ts';
export function recitationQueue(reciter:string,sura:number,aya:number){
  recitationUrl(reciter,sura,aya);
  return Array.from({length:quran.Sura[sura]!.ayas-aya+1},(_,i)=>({sura,aya:aya+i,url:recitationUrl(reciter,sura,aya+i)}));
}
export function sleepDeadline(minutes:number,now:number){if(![0,5,15,30,60].includes(minutes)||!Number.isFinite(now))throw new Error('INVALID_SLEEP_TIMER');return minutes?now+minutes*60000:0;}
