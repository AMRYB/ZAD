import test from 'node:test';
import assert from 'node:assert/strict';
import {cairoTimestamp,type PrayerDay} from '../src/core/adhan.ts';
import {prayerArcPoint,prayerTimeline,remainingTime} from '../src/core/prayer-display.ts';
const day:PrayerDay={date:'2026-10-29',hijri:'',times:{fajr:'04:40',sunrise:'06:05',dhuhr:'11:39',asr:'14:48',maghrib:'17:13',isha:'18:31'}};
test('Prayer progression is temporal, excludes sunrise from next prayer, and handles exact boundaries',()=>{
  let model=prayerTimeline(day,cairoTimestamp(day.date,'04:39'));assert.equal(model.progress,0);assert.equal(model.next?.key,'fajr');
  model=prayerTimeline(day,cairoTimestamp(day.date,'04:40'));assert.equal(model.next?.key,'dhuhr');assert.equal(model.entries.filter(e=>e.at<=cairoTimestamp(day.date,'04:40')).length,1);
  model=prayerTimeline(day,cairoTimestamp(day.date,'06:05'));assert.equal(model.next?.key,'dhuhr');
  assert.equal(prayerTimeline(day,cairoTimestamp(day.date,'18:31')).progress,1);
});
test('After Isha uses the following official day rather than inventing tomorrow Fajr',()=>{
  const now=cairoTimestamp(day.date,'19:00');assert.equal(prayerTimeline(day,now).next,undefined);
  const next={...day,date:'2026-10-30'};const model=prayerTimeline(day,now,next);assert.equal(model.next?.key,'fajr');assert.equal(model.next?.at,cairoTimestamp(next.date,next.times.fajr));
  assert.equal(remainingTime(600001),'0:11');assert.equal(remainingTime(-10),'0:00');
});
test('Arc remains bounded and does not reverse under RTL',()=>{
  assert.deepEqual(prayerArcPoint(-2,300,100),{x:0,y:100-100*Math.sin(Math.PI)});
  const middle=prayerArcPoint(.5,300,100);assert.ok(Math.abs(middle.x-150)<1e-8);assert.equal(middle.y,0);
  assert.deepEqual(prayerArcPoint(2,300,100),{x:300,y:100});
});
test('Next Fajr countdown honors Cairo DST fallback and month rollover',()=>{
  const next={...day,date:'2026-10-30',times:{...day.times,fajr:'04:39'}};
  // The repeated23:30 occurs twice; use actual instants, as the screen clock does.
  const now=Date.parse('2026-10-29T20:30:00Z'),model=prayerTimeline(day,now,next);
  assert.equal(remainingTime(model.next!.at-now),'6:09');
  assert.equal(remainingTime(prayerTimeline(day,now+3600000,next).next!.at-now-3600000),'5:09');
  const end={...day,date:'2026-10-31'},start={...day,date:'2026-11-01'};
  assert.equal(prayerTimeline(end,cairoTimestamp(end.date,'23:00'),start).next?.at,cairoTimestamp(start.date,start.times.fajr));
});
