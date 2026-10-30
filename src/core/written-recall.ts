import {quran} from '../data/quran.ts';
import {parseDate} from './calendar.ts';
export interface RecallRange {surah:number;from:number;to:number;current:number;completed:boolean}
export interface RecallAttempt {id:string;date:string;surah:number;ayah:number;matched:number;total:number;letterErrors:number;missing:number;extra:number;hinted:boolean}
export interface RecallState {last:RecallRange|null;attempts:RecallAttempt[]}
export const initialRecall=():RecallState=>({last:null,attempts:[]});
const integer=(v:number,max:number)=>Number.isInteger(v)&&v>=0&&v<=max;
export function validRecallRange(v:RecallRange){return !!v&&integer(v.surah,114)&&v.surah>0&&integer(v.from,quran.Sura[v.surah]!.ayas)&&v.from>0&&integer(v.to,quran.Sura[v.surah]!.ayas)&&v.to>=v.from&&integer(v.current,v.to)&&v.current>=v.from&&typeof v.completed==='boolean';}
export function validRecallAttempt(a:RecallAttempt){try{return !!a&&Object.keys(a).every(k=>['id','date','surah','ayah','matched','total','letterErrors','missing','extra','hinted'].includes(k))&&typeof a.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(a.id)&&!!parseDate(a.date)&&integer(a.surah,114)&&a.surah>0&&integer(a.ayah,quran.Sura[a.surah]!.ayas)&&a.ayah>0&&integer(a.total,1000)&&a.total>0&&integer(a.matched,a.total)&&integer(a.letterErrors,8000)&&integer(a.missing,1000)&&integer(a.extra,1000)&&typeof a.hinted==='boolean';}catch{return false;}}
export function validRecall(v:RecallState){return !!v&&(v.last===null||validRecallRange(v.last))&&Array.isArray(v.attempts)&&v.attempts.length<=100&&new Set(v.attempts.map(a=>a?.id)).size===v.attempts.length&&v.attempts.every(validRecallAttempt);}
export function mergeRecall(a:RecallState,b:RecallState):RecallState{return {last:a.last??b.last,attempts:[...a.attempts,...b.attempts.filter(x=>!a.attempts.some(y=>y.id===x.id))].sort((x,y)=>x.date.localeCompare(y.date)||x.id.localeCompare(y.id)).slice(-100)};}
/** Compare ordinary spelling; preserve hamza, ta marbuta and alif maqsura differences. */
export function recallWords(text:string){return text.normalize('NFKC').normalize('NFC').replace(/[\u0610-\u061A\u064B-\u0653\u0656-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g,'').replace(/ٱ/g,'ا').replace(/[ـ\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g,'').replace(/[^\p{L}\p{M}]+/gu,' ').trim().split(/\s+/).filter(Boolean);}
export interface LetterDifference {kind:'same'|'changed'|'missing'|'extra';expected:string;entered:string}
export interface WordDifference {kind:'same'|'changed'|'missing'|'extra';expected:string;entered:string;letters:LetterDifference[]}
function align(expected:string[],entered:string[],same=(a:string,b:string)=>a===b){
  const n=expected.length,m=entered.length,stride=m+1,dp=new Uint16Array((n+1)*stride);
  for(let i=0;i<=n;i++)dp[i*stride]=i;for(let j=0;j<=m;j++)dp[j]=j;
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)dp[i*stride+j]=Math.min(dp[(i-1)*stride+j]+1,dp[i*stride+j-1]+1,dp[(i-1)*stride+j-1]+(same(expected[i-1],entered[j-1])?0:1));
  const result:{kind:WordDifference['kind'];expected:string;entered:string}[]=[];let i=n,j=m;
  while(i||j){const cost=dp[i*stride+j];if(i&&j&&cost===dp[(i-1)*stride+j-1]+(same(expected[i-1],entered[j-1])?0:1)){result.push({kind:same(expected[i-1],entered[j-1])?'same':'changed',expected:expected[--i],entered:entered[--j]});}else if(i&&cost===dp[(i-1)*stride+j]+1)result.push({kind:'missing',expected:expected[--i],entered:''});else result.push({kind:'extra',expected:'',entered:entered[--j]});}
  return {distance:dp[n*stride+m],rows:result.reverse()};
}
export function compareRecall(emlaey:string,uthmani:string,answer:string){
  if(answer.length>6000)throw new Error('ANSWER_TOO_LONG');const expected=recallWords(emlaey),other=recallWords(uthmani),entered=recallWords(answer);
  if(!expected.length||expected.length>300||entered.length>300)throw new Error('WORD_LIMIT');
  const ordinary=align(expected,entered),source=align(other,entered);
  // Accept either official orthography as a whole; never rewrite either source string.
  const selected=source.distance<ordinary.distance?source:ordinary;
  const words:WordDifference[]=selected.rows.map(row=>({...row,letters:row.kind==='same'?[]:align([...row.expected],[...row.entered]).rows as LetterDifference[]}));
  return {words,matched:words.filter(w=>w.kind==='same').length,total:selected===source?other.length:expected.length,missing:words.filter(w=>w.kind==='missing').length,extra:words.filter(w=>w.kind==='extra').length,letterErrors:words.reduce((n,w)=>n+w.letters.filter(l=>l.kind!=='same').length,0),correct:selected.distance===0};
}
