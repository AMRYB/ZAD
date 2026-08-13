import {createContext,useContext} from 'react';
import type {Bookmark} from '../core/model';
export interface RecitationValue {
  verse:Bookmark|null;reciter:string|null;playing:boolean;loading:boolean;error:boolean;repeat:boolean;
  currentTime:number;duration:number;deadline:number;sleepExact:boolean;
  playFrom:(reciter:string,sura:number,aya:number)=>void;toggle:()=>void;pause:()=>void;stop:()=>void;
  next:()=>void;previous:()=>void;setRepeat:(value:boolean)=>void;setSleep:(minutes:number)=>void;
  subscribe:(listener:(verse:Bookmark)=>void)=>(()=>void);
}
export const RecitationContext=createContext<RecitationValue|null>(null);
export function useRecitation(){const value=useContext(RecitationContext);if(!value)throw new Error('RECITATION_PROVIDER_MISSING');return value;}
