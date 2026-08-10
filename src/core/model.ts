import { addDays, dateInZone, parseDate } from './calendar.ts';
import { quran } from '../data/quran.ts';
import {reciterById,tafsirById,type ReciterId,type TafsirId} from '../data/ksu-readers.ts';
export type Locale = 'ar' | 'en';
export type ThemeMode = 'system' | 'light' | 'dark';
export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type Prayer = typeof PRAYERS[number];
export type PrayerStatus = 'unlogged' | 'completed' | 'skipped' | 'excused';
export type FastStatus = 'unlogged' | 'fasted' | 'notFasted' | 'excused';
export interface DayRecord { prayers: Partial<Record<Prayer, PrayerStatus>>; fast: FastStatus; note: string }
export interface Goal { id: string; title: string; target: number; progress: number }
export interface ReadingPlan { id: string; title: string; target: number; deadline: string; pages: number[] }
export interface Bookmark { sura: number; aya: number }
export interface Habit { id:string; title:string; dates:string[] }
export interface ReaderPreferences {reciter:ReciterId;tafsir:TafsirId;fit:'page'|'width'}
export interface State {
  version: 1; onboarded: boolean; locale: Locale; theme: ThemeMode;
  season: { start: string | null; length: 29 | 30; adjustment: number };
  days: Record<string, DayRecord>; goals: Goal[]; plans: ReadingPlan[]; habits: Habit[];
  bookmarks: Bookmark[]; lastRead: Bookmark;
  reader: ReaderPreferences;
}
export function initialState(): State {
  return { version: 1, onboarded: false, locale: 'ar', theme: 'system',
    season: { start: null, length: 30, adjustment: 0 }, days: {}, goals: [], plans: [], habits: [], bookmarks: [], lastRead: { sura: 1, aya: 1 },reader:{reciter:'husary',tafsir:'sa3dy',fit:'page'} };
}
export function emptyDay(): DayRecord { return { prayers: {}, fast: 'unlogged', note: '' }; }
export type Action =
  | { type: 'settings'; locale?: Locale; theme?: ThemeMode }
  | { type: 'onboard' }
  | {type:'readerSettings';reciter?:ReciterId;tafsir?:TafsirId;fit?:'page'|'width'}
  | { type: 'season'; start: string | null; length: 29 | 30; adjustment: number }
  | { type: 'prayer'; date: string; prayer: Prayer; status: PrayerStatus }
  | { type: 'fast'; date: string; status: FastStatus }
  | { type: 'note'; date: string; text: string }
  | { type: 'goalAdd'; id: string; title: string; target: number }
  | { type: 'goalStep'; id: string; change: number }
  | { type: 'goalDelete'; id: string }
  | { type:'habitAdd'; id:string; title:string }
  | { type:'habitToggle'; id:string; date:string }
  | { type:'habitDelete'; id:string }
  | { type: 'planAdd'; id: string; title: string; target: number; deadline: string }
  | { type: 'planPage'; id: string; page: number; completed: boolean }
  | { type: 'planDelete'; id: string }
  | { type: 'bookmark'; sura: number; aya: number }
  | { type: 'lastRead'; sura: number; aya: number };
function positive(value: number, max: number): boolean { return Number.isInteger(value) && value > 0 && value <= max; }
function validVerse(sura:number,aya:number):boolean { return positive(sura,114)&&positive(aya,quran.Sura[sura]?.ayas??0); }
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'settings': return { ...state, locale: action.locale ?? state.locale, theme: action.theme ?? state.theme };
    case 'readerSettings': {
      const reader={reciter:action.reciter??state.reader.reciter,tafsir:action.tafsir??state.reader.tafsir,fit:action.fit??state.reader.fit};
      if(!reciterById(reader.reciter)||!tafsirById(reader.tafsir)||!['page','width'].includes(reader.fit))return state;
      return {...state,reader};
    }
    case 'onboard': return { ...state, onboarded: true };
    case 'season':
      if (action.start) parseDate(action.start);
      if (![29,30].includes(action.length) || !Number.isInteger(action.adjustment) || Math.abs(action.adjustment) > 2) return state;
      return { ...state, season: { start: action.start, length: action.length, adjustment: action.adjustment } };
    case 'prayer': case 'fast': case 'note': {
      parseDate(action.date);
      const day = { ...(state.days[action.date] ?? emptyDay()) };
      if (action.type === 'prayer') day.prayers = { ...day.prayers, [action.prayer]: action.status };
      if (action.type === 'fast') day.fast = action.status;
      if (action.type === 'note') day.note = action.text.slice(0, 6000);
      return { ...state, days: { ...state.days, [action.date]: day } };
    }
    case 'goalAdd':
      if (!action.title.trim() || !positive(action.target, 100000) || state.goals.some(x => x.id === action.id)) return state;
      return { ...state, goals: [...state.goals, { id: action.id, title: action.title.trim().slice(0, 100), target: action.target, progress: 0 }] };
    case 'goalStep': return !Number.isInteger(action.change)?state:{ ...state, goals: state.goals.map(g => g.id === action.id ? { ...g, progress: Math.max(0, Math.min(g.target, g.progress + action.change)) } : g) };
    case 'goalDelete': return { ...state, goals: state.goals.filter(g => g.id !== action.id) };
    case 'habitAdd': return !action.title.trim()||state.habits.some(h=>h.id===action.id)?state:{...state,habits:[...state.habits,{id:action.id,title:action.title.trim().slice(0,100),dates:[]}]};
    case 'habitToggle': parseDate(action.date);return {...state,habits:state.habits.map(h=>h.id!==action.id?h:{...h,dates:h.dates.includes(action.date)?h.dates.filter(d=>d!==action.date):[...h.dates,action.date]})};
    case 'habitDelete': return {...state,habits:state.habits.filter(h=>h.id!==action.id)};
    case 'planAdd':
      if (!action.title.trim() || !positive(action.target, 604) || state.plans.some(p => p.id === action.id)) return state;
      parseDate(action.deadline);
      return { ...state, plans: [...state.plans, { id: action.id, title: action.title.trim().slice(0,100), target: action.target, deadline: action.deadline, pages: [] }] };
    case 'planPage': return { ...state, plans: state.plans.map(p => p.id !== action.id || !positive(action.page, p.target) ? p : { ...p, pages: action.completed ? [...new Set([...p.pages, action.page])].sort((a,b) => a-b) : p.pages.filter(n => n !== action.page) }) };
    case 'planDelete': return { ...state, plans: state.plans.filter(p => p.id !== action.id) };
    case 'bookmark': {
      if(!validVerse(action.sura,action.aya))return state;
      const exists = state.bookmarks.some(b => b.sura === action.sura && b.aya === action.aya);
      return { ...state, bookmarks: exists ? state.bookmarks.filter(b => b.sura !== action.sura || b.aya !== action.aya) : [...state.bookmarks, { sura: action.sura, aya: action.aya }] };
    }
    case 'lastRead': return !validVerse(action.sura,action.aya)||(state.lastRead.sura === action.sura && state.lastRead.aya === action.aya) ? state : { ...state, lastRead: { sura: action.sura, aya: action.aya } };
  }
}
// Fail closed on an unknown schema; never replace unreadable user data silently.
export function restoreState(text: string): State {
  const value = JSON.parse(text);
  if(value&&value.version===1&&value.habits===undefined)value.habits=[];
  if(value&&value.version===1&&value.reader===undefined)value.reader=initialState().reader;
  if (!value || value.version !== 1 || !['ar','en'].includes(value.locale) || !['system','light','dark'].includes(value.theme)
    || typeof value.onboarded !== 'boolean' || !value.season || ![29,30].includes(value.season.length)
    || !Number.isInteger(value.season.adjustment) || Math.abs(value.season.adjustment) > 2
    || !value.days || typeof value.days !== 'object' || Array.isArray(value.days)
    || !Array.isArray(value.goals) || !Array.isArray(value.plans) || !Array.isArray(value.bookmarks)
    || !value.lastRead || !validVerse(value.lastRead.sura,value.lastRead.aya) || !Array.isArray(value.habits)
    || !value.reader || !reciterById(value.reader.reciter)||!tafsirById(value.reader.tafsir)||!['page','width'].includes(value.reader.fit)) throw new Error('INVALID_STORAGE');
  if (value.season.start !== null) parseDate(value.season.start);
  for (const [date, day] of Object.entries(value.days) as [string, DayRecord][]) {
    parseDate(date);
    if (!day || typeof day.note !== 'string' || !['unlogged','fasted','notFasted','excused'].includes(day.fast) || !day.prayers) throw new Error('INVALID_STORAGE');
    for (const [key, status] of Object.entries(day.prayers)) if (!(PRAYERS as readonly string[]).includes(key) || !['unlogged','completed','skipped','excused'].includes(status)) throw new Error('INVALID_STORAGE');
  }
  for (const g of value.goals) if (!g || typeof g.id !== 'string' || typeof g.title !== 'string' || !positive(g.target,100000) || !Number.isInteger(g.progress) || g.progress < 0 || g.progress > g.target) throw new Error('INVALID_STORAGE');
  for (const p of value.plans) {
    if (!p || typeof p.id !== 'string' || typeof p.title !== 'string' || !positive(p.target,604) || !Array.isArray(p.pages) || p.pages.some((n:number) => !positive(n,p.target))) throw new Error('INVALID_STORAGE');
    parseDate(p.deadline);
  }
  for(const h of value.habits){if(!h||typeof h.id!=='string'||typeof h.title!=='string'||!Array.isArray(h.dates))throw new Error('INVALID_STORAGE');for(const d of h.dates)parseDate(d);}
  for (const b of value.bookmarks) if (!b || !validVerse(b.sura,b.aya)) throw new Error('INVALID_STORAGE');
  return value as State;
}
export function newId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`; }
export function defaultDeadline(): string { return addDays(dateInZone(), 29); }
export function totals(state: State) {
  const days = Object.values(state.days);
  return { prayers: days.reduce((n,d) => n + Object.values(d.prayers).filter(x => x === 'completed').length,0),
    fasts: days.filter(d => d.fast === 'fasted').length,
    pages: new Set(state.plans.flatMap(p => p.pages)).size,
    goals: state.goals.filter(g => g.progress === g.target).length,
    recordedDays: days.filter(d => d.fast !== 'unlogged' || Object.values(d.prayers).some(x => x !== 'unlogged')).length };
}
