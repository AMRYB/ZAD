import {parseDate} from './calendar.ts';
import catalogue from '../data/adhkar.json' with {type:'json'};
const knownDhikr=new Map(catalogue.entries.map(e=>[e.id,e]));

export const tasbihPhrases=[
  {id:'subhan',ar:'سُبْحَانَ اللَّهِ',en:'Glory be to Allah'},
  {id:'hamd',ar:'الْحَمْدُ لِلَّهِ',en:'All praise is for Allah'},
  {id:'takbir',ar:'اللَّهُ أَكْبَرُ',en:'Allah is the Greatest'},
  {id:'istighfar',ar:'أَسْتَغْفِرُ اللَّهَ',en:'I seek Allah’s forgiveness'},
  {id:'salawat',ar:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',en:'O Allah, send peace and blessings upon our Prophet Muhammad'},
] as const;
export type TasbihPhrase=typeof tasbihPhrases[number]['id'];
export const categories=['morning','evening','sleep','waking','prayer','varied'] as const;
export type AdhkarCategory=typeof categories[number];
export const deedPresets=[
  {id:'charity',ar:'الصدقة',en:'Charity',detailAr:'تسجيل عمل خيري',detailEn:'Record a charitable act',icon:'hand-holding-heart'},
  {id:'parents',ar:'بر الوالدين',en:'Kindness to parents',detailAr:'مساعدة أو صلة',detailEn:'Help or spend time together',icon:'heart'},
  {id:'kinship',ar:'صلة الرحم',en:'Family ties',detailAr:'زيارة أو اتصال',detailEn:'Visit or make a call',icon:'phone'},
  {id:'food',ar:'إطعام الطعام',en:'Sharing food',detailAr:'مساعدة المحتاجين',detailEn:'Help someone in need',icon:'utensils'},
  {id:'learning',ar:'طلب العلم',en:'Learning',detailAr:'درس أو فائدة',detailEn:'A lesson or useful insight',icon:'book-open'},
  {id:'istighfar',ar:'الاستغفار',en:'Seeking forgiveness',detailAr:'جلسة ذكر',detailEn:'A moment of remembrance',icon:'circle-nodes'},
  {id:'kindword',ar:'الكلمة الطيبة',en:'A kind word',detailAr:'نشر الخير',detailEn:'Encourage or support someone',icon:'comment'},
  {id:'night',ar:'قيام الليل',en:'Night prayer',detailAr:'متابعة شخصية',detailEn:'Private personal tracking',icon:'moon'},
] as const;
export interface ReminderSettings {enabled:boolean;times:string[]}
export interface DevotionState {
  tasbih:{phrase:TasbihPhrase;target:number;haptics:boolean;counts:Record<TasbihPhrase,number>;daily:Record<string,number>};
  adhkar:{counts:Record<string,Record<string,number>>;favorites:string[];last:Partial<Record<AdhkarCategory,string>>;fontSize:number};
  deeds:{selected:string[];custom:{id:string;title:string;archived?:boolean}[];days:Record<string,string[]>};
  reminders:{adhkar:ReminderSettings;deeds:ReminderSettings};
}
export function initialDevotion():DevotionState{return {
  tasbih:{phrase:'subhan',target:33,haptics:true,counts:{subhan:0,hamd:0,takbir:0,istighfar:0,salawat:0},daily:{}},
  adhkar:{counts:{},favorites:[],last:{},fontSize:26},deeds:{selected:[],custom:[],days:{}},
  reminders:{adhkar:{enabled:false,times:['07:00','18:00','22:00']},deeds:{enabled:false,times:['09:00','15:00','20:00']}},
};}
export type DevotionAction=
  |{type:'tasbihTap';date:string;change:1|-1}
  |{type:'tasbihSettings';phrase?:TasbihPhrase;target?:number;haptics?:boolean}
  |{type:'tasbihReset'}
  |{type:'adhkarStep';session:string;id:string;limit:number;change:1|-1}
  |{type:'adhkarFavorite';id:string}
  |{type:'adhkarPosition';category:AdhkarCategory;id:string}
  |{type:'adhkarReset';session:string}
  |{type:'adhkarFont';size:number}
  |{type:'deedSelect';id:string}
  |{type:'deedAdd';id:string;title:string}
  |{type:'deedArchive';id:string}
  |{type:'deedToggle';id:string;date:string}
  |{type:'reminders';kind:'adhkar'|'deeds';value:ReminderSettings};
const integer=(n:unknown,max=1000000000):n is number=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<=max;
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function validReminder(v:unknown):v is ReminderSettings{return record(v)&&typeof v.enabled==='boolean'&&Array.isArray(v.times)&&v.times.length===3&&v.times.every(t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t))&&new Set(v.times).size===3;}
export function adhkarSession(date:string,category:AdhkarCategory,prayer='general'){parseDate(date);if(!categories.includes(category)||!['general','fajr','dhuhr','asr','maghrib','isha'].includes(prayer))throw new Error('INVALID_SESSION');return `${date}:${category}:${category==='prayer'?prayer:'general'}`;}
function validSession(key:string){const [date,category,prayer,...extra]=key.split(':');try{return !extra.length&&adhkarSession(date,category as AdhkarCategory,prayer)===key;}catch{return false;}}
export function roundProgress(count:number,target:number){return {current:count===0?0:(count-1)%target+1,rounds:Math.floor(count/target)};}
export function reduceDevotion(s:DevotionState,a:DevotionAction):DevotionState{
  switch(a.type){
    case 'tasbihTap':{
      parseDate(a.date);if(a.change!==1&&a.change!==-1)return s;const key=s.tasbih.phrase;const value=s.tasbih.counts[key];
      if(a.change<0&&(value===0||!(s.tasbih.daily[a.date]>0))||a.change>0&&(value>=1000000000||(s.tasbih.daily[a.date]??0)>=1000000000))return s;
      return {...s,tasbih:{...s.tasbih,counts:{...s.tasbih.counts,[key]:value+a.change},daily:{...s.tasbih.daily,[a.date]:(s.tasbih.daily[a.date]??0)+a.change}}};
    }
    case 'tasbihSettings':if(a.phrase&&!tasbihPhrases.some(p=>p.id===a.phrase)||a.target!==undefined&&(!integer(a.target,10000)||a.target===0)||a.haptics!==undefined&&typeof a.haptics!=='boolean')return s;return {...s,tasbih:{...s.tasbih,...a.phrase?{phrase:a.phrase}:{},...a.target?{target:a.target}:{},...a.haptics!==undefined?{haptics:a.haptics}:{}}};
    case 'tasbihReset':return {...s,tasbih:{...s.tasbih,counts:{...s.tasbih.counts,[s.tasbih.phrase]:0}}};
    case 'adhkarStep':{
      const entry=knownDhikr.get(a.id);if(!entry||!validSession(a.session)||!entry.categories.includes(a.session.split(':')[1])||a.limit!==entry.repeat||a.change!==1&&a.change!==-1)return s;
      const old=s.adhkar.counts[a.session]??{};return {...s,adhkar:{...s.adhkar,counts:{...s.adhkar.counts,[a.session]:{...old,[a.id]:Math.max(0,Math.min(a.limit,(old[a.id]??0)+a.change))}}}};
    }
    case 'adhkarFavorite':if(!knownDhikr.has(a.id))return s;return {...s,adhkar:{...s.adhkar,favorites:s.adhkar.favorites.includes(a.id)?s.adhkar.favorites.filter(id=>id!==a.id):[...s.adhkar.favorites,a.id]}};
    case 'adhkarPosition':if(!categories.includes(a.category)||!knownDhikr.get(a.id)?.categories.includes(a.category))return s;return {...s,adhkar:{...s.adhkar,last:{...s.adhkar.last,[a.category]:a.id}}};
    case 'adhkarReset':if(!validSession(a.session))return s;return {...s,adhkar:{...s.adhkar,counts:{...s.adhkar.counts,[a.session]:{}}}};
    case 'adhkarFont':return [22,26,30,34].includes(a.size)?{...s,adhkar:{...s.adhkar,fontSize:a.size}}:s;
    case 'deedAdd':if(!/^custom-[a-z0-9-]{1,60}$/.test(a.id)||!a.title.trim()||s.deeds.custom.length>=100||s.deeds.custom.some(d=>d.id===a.id))return s;return {...s,deeds:{...s.deeds,custom:[...s.deeds.custom,{id:a.id,title:a.title.trim().slice(0,100)}],selected:[...s.deeds.selected,a.id]}};
    case 'deedSelect':if(!deedPresets.some(d=>d.id===a.id)&&!s.deeds.custom.some(d=>d.id===a.id&&!d.archived))return s;return {...s,deeds:{...s.deeds,selected:s.deeds.selected.includes(a.id)?s.deeds.selected.filter(id=>id!==a.id):[...s.deeds.selected,a.id]}};
    case 'deedArchive':return {...s,deeds:{...s.deeds,selected:s.deeds.selected.filter(id=>id!==a.id),custom:s.deeds.custom.map(d=>d.id===a.id?{...d,archived:true}:d)}};
    case 'deedToggle':parseDate(a.date);if(!s.deeds.selected.includes(a.id))return s;{const old=s.deeds.days[a.date]??[];return {...s,deeds:{...s.deeds,days:{...s.deeds.days,[a.date]:old.includes(a.id)?old.filter(id=>id!==a.id):[...old,a.id]}}};}
    case 'reminders':return validReminder(a.value)?{...s,reminders:{...s.reminders,[a.kind]:a.value}}:s;
  }
}
export function validateDevotion(value:unknown):value is DevotionState{
  try{
    if(!record(value)||!record(value.tasbih)||!record(value.adhkar)||!record(value.deeds)||!record(value.reminders))return false;
    const t=value.tasbih,d=value.deeds,a=value.adhkar;
    if(!tasbihPhrases.some(p=>p.id===t.phrase)||!integer(t.target,10000)||!t.target||typeof t.haptics!=='boolean'||!record(t.counts)||Object.keys(t.counts).length!==tasbihPhrases.length||!tasbihPhrases.every(p=>integer((t.counts as Record<string,unknown>)[p.id]))||!record(t.daily))return false;
    for(const [date,n] of Object.entries(t.daily)){parseDate(date);if(!integer(n))return false;}
    if(!record(a.counts)||!Array.isArray(a.favorites)||!a.favorites.every(id=>typeof id==='string'&&knownDhikr.has(id))||new Set(a.favorites).size!==a.favorites.length||!record(a.last)||typeof a.fontSize!=='number'||![22,26,30,34].includes(a.fontSize))return false;
    for(const [category,id] of Object.entries(a.last))if(!categories.includes(category as AdhkarCategory)||typeof id!=='string'||!knownDhikr.get(id)?.categories.includes(category))return false;
    for(const [key,counts] of Object.entries(a.counts)){if(!validSession(key)||!record(counts))return false;for(const [id,n] of Object.entries(counts)){const entry=knownDhikr.get(id);if(!entry||!entry.categories.includes(key.split(':')[1])||!integer(n,entry.repeat))return false;}}
    if(!Array.isArray(d.custom)||d.custom.length>100||!d.custom.every(v=>record(v)&&typeof v.id==='string'&&/^custom-[a-z0-9-]{1,60}$/.test(v.id)&&typeof v.title==='string'&&v.title.trim().length>0&&v.title.length<=100&&(v.archived===undefined||typeof v.archived==='boolean'))||!Array.isArray(d.selected)||!record(d.days))return false;
    const custom=d.custom as {id:string;title:string;archived?:boolean}[];
    const ids=new Set<string>([...deedPresets.map(p=>p.id),...custom.map(v=>v.id)]);if(new Set(custom.map(v=>v.id)).size!==custom.length||new Set(d.selected).size!==d.selected.length||!d.selected.every(id=>ids.has(id)&&!custom.some(v=>v.id===id&&v.archived)))return false;
    for(const [date,list] of Object.entries(d.days)){parseDate(date);if(!Array.isArray(list)||new Set(list).size!==list.length||!list.every(id=>ids.has(id)))return false;}
    return validReminder(value.reminders.adhkar)&&validReminder(value.reminders.deeds);
  }catch{return false;}
}
