import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

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
  integer(verse, 1, 286); // Use metadata.Sura[sura].ayas for chapter-specific validation.
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
  aya(sura, verse);
  return `${BASE}/ayat/mp3/Husary_64kbps/${String(sura).padStart(3, '0')}${String(verse).padStart(3, '0')}.mp3`;
}
export function hilitesUrl(page: number): string {
  return api({ do: 'hilites', mosshaf: 'hafs', t: 28, page: integer(page, 1, 604) });
}
export function saadieTafsirUrl(sura: number, verse: number): string {
  aya(sura, verse);
  return api({ do: 'tafsir', author: 'sa3dy', sura, aya: verse });
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
export function pageForAya(starts: number[][], sura: number, verse: number): number {
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

export async function offlineCheck(): Promise<void> {
  const fixtures = JSON.parse(await readFile(new URL('./ksu-highlight-fixtures.json', import.meta.url), 'utf8'));
  let count = 0;
  for (const f of fixtures) {
    assert.deepEqual(hafsRects(f.page, f.coordinates), f.dom);
    count += f.dom.length;
  }
  const meta = JSON.parse(await readFile(new URL('./ksu-navigation-metadata.json', import.meta.url), 'utf8'));
  for (const [s, a, p] of [[1,1,1], [2,1,2], [2,5,2], [2,6,3], [2,16,3], [2,17,4], [114,6,604]]) {
    assert.equal(pageForAya(meta.Page, s, a), p);
  }
  assert.equal(husaryAudio(1, 2), `${BASE}/ayat/mp3/Husary_64kbps/001002.mp3`);
  assert.deepEqual(splitTafsir('verse|||<p>text</p>'), { verseText: 'verse', tafsirHtml: '<p>text</p>' });
  assert.throws(() => pageImage(0), RangeError);
  console.log(JSON.stringify({ offline: 'PASS', domRectangles: count, pages: fixtures.length, navigationCases: 7 }));
}

// Exactly five sequential requests. No cookies, auth headers, retries, or full corpus downloads.
export async function liveSmoke(): Promise<void> {
  const cases = [
    { kind: 'png', url: pageImage(1) },
    { kind: 'mp3', url: husaryAudio(1, 1) },
    { kind: 'hilites', url: hilitesUrl(1) },
    { kind: 'tafsir', url: saadieTafsirUrl(1, 4) },
    { kind: 'tarjama', url: translationUrl([1,1], [2,1]) },
  ];
  for (const test of cases) {
    const response = await fetch(test.url, { credentials: 'omit',
      headers: test.kind === 'mp3' ? { Range: 'bytes=0-15' } : {},
      signal: AbortSignal.timeout(15000) });
    assert.ok(response.ok, `${test.kind}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const text = test.kind === 'png' || test.kind === 'mp3' ? '' : bytes.toString('utf8');
    if (test.kind === 'png') assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    if (test.kind === 'mp3') assert.match(response.headers.get('content-type') ?? '', /audio\/mpeg/i);
    if (test.kind === 'hilites') assert.deepEqual(JSON.parse(text)['1']['1_1'], [181,301]);
    if (test.kind === 'tafsir') assert.match(splitTafsir(text).tafsirHtml, /<p>/);
    if (test.kind === 'tarjama') assert.equal(typeof JSON.parse(text).tafsir['1_1'].text, 'string');
    console.log(JSON.stringify({ kind: test.kind, method: 'GET', url: test.url, status: response.status,
      contentType: response.headers.get('content-type'), bytes: bytes.length, result: 'PASS' }));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await offlineCheck();
  if (process.argv.includes('--live')) await liveSmoke();
}
