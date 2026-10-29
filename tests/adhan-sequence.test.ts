import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {adhanPrayers,adhanSequence,adhanClips,audioSlot,clipId} from '../src/core/adhan-sequence.ts';
test('Each normal prayer has its own intro and the exact requested voice',()=>{
  const expected={fajr:'tobar-fajr',dhuhr:'shuaisha',asr:'husary',maghrib:'rifaat',isha:'tobar-isha'};
  for(const p of adhanPrayers)assert.deepEqual(adhanSequence('2026-10-24',p),['intro-'+p,expected[p],'shaarawy-dua']);
  assert.notEqual(adhanSequence('2026-10-24','fajr')[1],adhanSequence('2026-10-24','isha')[1]);
});
test('Friday replaces only Dhuhr, using the event Cairo date through DST and year boundaries',()=>{
  for(const d of ['2026-10-23','2026-10-30','2027-01-01']){
    assert.deepEqual(adhanSequence(d,'dhuhr'),['intro-friday','azhar-friday','shaarawy-dua']);
    for(const p of adhanPrayers.filter(p=>p!=='dhuhr'))assert.equal(audioSlot(d,p),p);
  }
  for(const d of ['2026-10-22','2026-10-24','2026-12-31'])assert.equal(audioSlot(d,'dhuhr'),'dhuhr');
});
test('Sunrise, malformed dates and arbitrary clip/path identifiers fail closed',()=>{
  for(const p of ['sunrise','test','../rifaat'])assert.throws(()=>adhanSequence('2026-10-24',p));
  assert.throws(()=>adhanSequence('2026-02-30','dhuhr'));assert.throws(()=>adhanSequence('2026-10-23T00:00:00Z','dhuhr'));
  for(const id of [null,'toString','__proto__','../../secret'])assert.equal(clipId(id),null);
});
test('Public catalogue pins thirteen bounded clips and keeps user-selected sources exact',async()=>{
  assert.equal(Object.keys(adhanClips).length,13);
  for(const clip of Object.values(adhanClips)){assert.match(clip.sha256,/^[a-f0-9]{64}$/);assert.ok(clip.bytes>0&&clip.bytes<8000000);assert.ok(clip.duration>0&&clip.duration<480);}
  assert.equal(adhanClips['shaarawy-dua'].source,'https://www.youtube.com/watch?v=mC0AcX-ACOo');
  assert.equal(adhanClips['intro-fajr'].source,'https://www.youtube.com/watch?v=KTPAoW-gSyo');
  assert.equal(adhanClips['intro-friday'].source,'https://www.youtube.com/watch?v=H6X_oDODWZU');
  assert.equal(adhanClips['azhar-friday'].source,'https://www.youtube.com/watch?v=cD3mXVGD4iI');
  const native=await readFile(new URL('../src/data/adhan-audio.json',import.meta.url),'utf8');assert.ok(!native.includes('googlevideo.com'));
});
