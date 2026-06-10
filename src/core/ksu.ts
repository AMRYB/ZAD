import { quran } from '../data/quran.ts';
import { reciterById,tafsirById } from '../data/ksu-readers.ts';
export const BASE = 'https://quran.ksu.edu.sa';
export type Aya = readonly [number, number];
export type Coordinates = Record<string, [number, number]>;
export type Rect = { id: string; top: number; left: number; width: number; height: number };

function integer(n: number, min: number, max: number): number {
  if (!Number.isInteger(n) || n < min || n > max) throw new RangeError(String(n));
  return n;
}
function aya(sura: number, verse: number): void {
  integer(sura, 1, 114);
  integer(verse, 1, quran.Sura[sura]?.ayas ?? 0);
}
function api(params: Record<string, string | number>): string {
  const url = new URL('/interface.php', BASE);
  url.searchParams.set('ui', 'pc');
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  return url.href;
}
export function pageImage(page: number): string {
  return `${BASE}/ayat/safahat1/${integer(page, 1, 604)}.png`;
}
export function husaryAudio(sura: number, verse: number): string {
  return recitationUrl('husary',sura,verse);
}
export function recitationUrl(reciterId:string,sura:number,verse:number):string {
  aya(sura, verse);
  const reciter=reciterById(reciterId);
  if(!reciter)throw new RangeError('UNKNOWN_KSU_RECITER');
  return `${BASE}/ayat/mp3/${reciter.folder}/${String(sura).padStart(3, '0')}${String(verse).padStart(3, '0')}.mp3`;
}
export function hilitesUrl(page: number): string {
  return api({ do: 'hilites', mosshaf: 'hafs', t: 28, page: integer(page, 1, 604) });
}
export function saadieTafsirUrl(sura: number, verse: number): string {
  return tafsirUrl('sa3dy',sura,verse);
}
export function tafsirUrl(author:string,sura:number,verse:number):string {
  aya(sura, verse);
  if(!tafsirById(author))throw new RangeError('UNKNOWN_KSU_TAFSIR');
  return api({ do: 'tafsir', author, sura, aya: verse });
}
export function translationUrl(begin: Aya, endExclusive: Aya): string {
  aya(...begin);
  // The final metadata entry is a boundary sentinel [115,1], not a real surah.
  integer(endExclusive[0], 1, 115);
  integer(endExclusive[1], 1, 286);
  return api({ do: 'tarjama', tafsir: 'ar_mu', b_sura: begin[0], b_aya: begin[1],
    e_sura: endExclusive[0], e_aya: endExclusive[1] }) + '&11';
}
export function splitTafsir(raw: string): { verseText: string; tafsirHtml: string } {
  const at = raw.indexOf('|||');
  if (at < 0) throw new Error('Missing observed tafsir delimiter');
  return { verseText: raw.slice(0, at), tafsirHtml: raw.slice(at + 3) };
}
export function pageForAya(starts: readonly (readonly number[])[], sura: number, verse: number): number {
  aya(sura, verse);
  for (let p = 1; p < starts.length; p++) {
    const [s, a] = starts[p];
    if (s > sura || (s === sura && a >= verse)) return s === sura && a === verse ? p : p - 1;
  }
  throw new Error('Metadata must include the terminal boundary');
}

// Port of engine.js:418–610, limited to the observed Hafs reading mode.
// Preserve response iteration order; x/y points are verse endings, not boxes.
export function hafsRects(page: number, coordinates: Coordinates): Rect[] {
  integer(page, 1, 604);
  const first = page <= 2;
  const h = first ? 20 : 30, margin = first ? 80 : 40, right = first ? 376 : 416;
  const ox = first ? 5 : 10, oy = first ? 10 : 15;
  let prevTop = 0, prevLeft = 0, index = 0;
  const rects: Rect[] = [];
  for (const [key, [x, y]] of Object.entries(coordinates)) {
    const verse = Number(key.split('_')[1]);
    const top = y - oy, left = x - ox;
    if (index === 0) {
      prevLeft = right;
      prevTop = first ? 270 : verse === 1 ? 80 : 37;
    } else if (verse === 1) {
      prevTop += 110;
      prevLeft = right;
    }
    const add = (part: number, t: number, l: number, w: number, height: number) =>
      rects.push({ id: `${key}__hilite_${part}`, top: t, left: l, width: w, height });
    const diff = top - prevTop;
    if (diff > h * 1.6) {
      add(1, prevTop, margin, prevLeft - margin, h);
      add(2, top, left, right - left, h);
      add(3, prevTop + h, margin, right - margin, diff - h);
    } else if (diff > h * 0.6) {
      add(1, prevTop, margin, prevLeft - margin, h);
      add(2, top, left, right - left, h);
    } else {
      add(1, top, left, prevLeft - left, h);
    }
    prevTop = top;
    prevLeft = left;
    index++;
  }
  return rects;
}

export function versePage(sura: number, verse: number): number { return pageForAya(quran.Page, sura, verse); }
export function pageStart(page: number): {sura: number; aya: number} {
  const [sura, verse] = quran.Page[integer(page, 1, 604)];
  return {sura: sura!, aya: verse!};
}
export function adjacentAya(sura: number, verse: number, delta: 1 | -1): {sura: number; aya: number} {
  aya(sura, verse);
  if (delta === 1) return verse < quran.Sura[sura]!.ayas ? {sura, aya: verse+1} : sura < 114 ? {sura:sura+1, aya:1} : {sura:1,aya:1};
  return verse > 1 ? {sura,aya:verse-1} : sura > 1 ? {sura:sura-1,aya:quran.Sura[sura-1]!.ayas} : {sura:114,aya:6};
}
export function plainTafsir(html: string): string {
  const entities: Record<string,string> = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'')
    .replace(/<\/?(?:p|div|br)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'')
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (raw,entity:string) => {
      if (entity[0] !== '#') return entities[entity.toLowerCase()] ?? raw;
      const hex = entity[1].toLowerCase() === 'x';
      const n = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : raw;
    }).replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}
export async function ksuFetch(url: string, signal: AbortSignal): Promise<Response> {
  if (new URL(url).origin !== BASE) throw new Error('KSU_ONLY');
  const response = await fetch(url, {signal, credentials:'omit'});
  if (!response.ok) throw new Error(`KSU_HTTP_${response.status}`);
  if (response.url && new URL(response.url).origin !== BASE) throw new Error('KSU_REDIRECT');
  return response;
}

