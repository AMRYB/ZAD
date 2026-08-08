import catalogue from '../data/adhkar.json' with {type:'json'};
import {adhkarSession,type AdhkarCategory} from './devotion.ts';
export interface Dhikr {id:string;categories:AdhkarCategory[];text:string;repeat:number;specifiedRepeat:boolean;instruction:string;reference:{ar:string;en:string};sourceNotes:number[];sourceParagraphs:number[];sourceTextSha256:string;daily?:boolean;quran?:{sura:number;aya:number}[]}
export const adhkarEntries=catalogue.entries as Dhikr[];
export const adhkarSource=catalogue.source;
export const categoryInfo=[
  {id:'morning',ar:'أذكار الصباح',en:'Morning adhkar',detailAr:'قراءة ومتابعة',detailEn:'Read and keep track',icon:'sun'},
  {id:'evening',ar:'أذكار المساء',en:'Evening adhkar',detailAr:'ورد المساء',detailEn:'Your evening remembrance',icon:'moon'},
  {id:'sleep',ar:'أذكار النوم',en:'Before sleep',detailAr:'قبل النوم',detailEn:'A peaceful close to the day',icon:'moon'},
  {id:'waking',ar:'أذكار الاستيقاظ',en:'Upon waking',detailAr:'بداية اليوم',detailEn:'Begin your day',icon:'sun'},
  {id:'prayer',ar:'بعد الصلاة',en:'After prayer',detailAr:'أذكار الصلوات',detailEn:'Remember after each prayer',icon:'circle-nodes'},
  {id:'varied',ar:'أذكار متنوعة',en:'Daily situations',detailAr:'مواقف الحياة',detailEn:'Remembrance through daily life',icon:'book-open'},
] as const;
export function entrySession(date:string,category:AdhkarCategory,entry:Dhikr,prayer='general'){return adhkarSession(date,entry.daily?'varied':category,entry.daily?'general':prayer);}
export function sectionEntries(category:AdhkarCategory,prayer='general'){
  return adhkarEntries.filter(e=>e.categories.includes(category)&&!(category==='prayer'&&e.id==='r92'&&!['fajr','maghrib','general'].includes(prayer))&&!(category==='prayer'&&e.id==='r93'&&!['fajr','general'].includes(prayer)));
}
