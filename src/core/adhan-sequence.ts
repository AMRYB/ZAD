import catalogue from '../data/adhan-audio.json' with {type:'json'};
import {parseDate} from './calendar.ts';
export const adhanPrayers=['fajr','dhuhr','asr','maghrib','isha'] as const;
export type AdhanPrayer=typeof adhanPrayers[number];
export type AudioSlot=AdhanPrayer|'friday';
export type ClipId=keyof typeof catalogue.clips;
export const adhanClips=catalogue.clips;
export function adhanPreviewUrl(id:ClipId){return `/api/adhan-audio?clip=${id}&v=${adhanClips[id].sha256}`;}
export function audioSlot(date:string,prayer:string):AudioSlot {
  const day=new Date(parseDate(date)).getUTCDay();
  if(!adhanPrayers.includes(prayer as AdhanPrayer))throw new Error('INVALID_ADHAN_PRAYER');
  return prayer==='dhuhr'&&day===5?'friday':prayer as AdhanPrayer;
}
export function adhanSequence(date:string,prayer:string):readonly [ClipId,ClipId,ClipId] {
  const sequence=catalogue.sequences[audioSlot(date,prayer)];
  return [sequence.intro as ClipId,sequence.adhan as ClipId,catalogue.afterAdhan as ClipId];
}
export function clipId(value:string|null):ClipId|null {
  return value!==null&&Object.hasOwn(adhanClips,value)?value as ClipId:null;
}
