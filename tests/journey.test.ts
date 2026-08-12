import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reducer,restoreState} from '../src/core/model.ts';
import {activityReport} from '../src/core/reports.ts';
import {nextPrayer,countdown} from '../src/core/next-prayer.ts';
import {parseEsaMonth,cairoTimestamp} from '../src/core/adhan.ts';
import {readFile} from 'node:fs/promises';
test('0.9 records migrate without changes or XP awards, with editable home sections',()=>{
  let s=reducer(initialState(),{type:'note',date:'2026-10-24',text:'private'});
  const previous={...s} as Record<string,unknown>;delete previous.personalization;
  const restored=restoreState(JSON.stringify(previous));assert.equal(restored.days['2026-10-24'].note,'private');assert.deepEqual(restored.gamification,s.gamification);
  s=reducer(restored,{type:'personalization',value:{complete:true,sections:['quran','tasbih']}});assert.deepEqual(restoreState(JSON.stringify(s)),s);
  assert.throws(()=>restoreState(JSON.stringify({...s,personalization:{complete:true,sections:[]}})));
  assert.throws(()=>restoreState(JSON.stringify({...s,personalization:{complete:true,sections:['quran','quran']}})));
});
test('reports respect date ranges, corrections and inclusive check-ins without inventing old reading dates',()=>{
  let s=initialState();s=reducer(s,{type:'fast',date:'2026-10-24',status:'excused'},'2026-10-24');
  s=reducer(s,{type:'habitAdd',id:'h',title:'private'});s=reducer(s,{type:'habitToggle',id:'h',date:'2026-10-23'},'2026-10-23');
  s=reducer(s,{type:'planAdd',id:'p',title:'Reading',target:604,deadline:'2026-12-01'});
  s=reducer(s,{type:'planPage',id:'p',page:1,completed:true},'2026-10-24');
  let report=activityReport(s,'2026-10-24',7);assert.equal(report.days.length,7);assert.equal(report.days[0].date,'2026-10-18');assert.equal(report.activeDays,2);assert.equal(report.pages,1);assert.equal(report.fasts,0);
  s=reducer(s,{type:'planPage',id:'p',page:1,completed:false},'2026-10-25');report=activityReport(s,'2026-10-24',7);assert.equal(report.pages,0);
  const old={...s,gamification:{ruleVersion:1,events:[]},plans:[{...s.plans[0],pages:[1,2,3]}]};assert.equal(activityReport(old as typeof s,'2026-10-24',30).pages,0);
});
test('next prayer skips sunrise, crosses midnight and filters other city timetables',async()=>{
  const html=await readFile(new URL('./fixtures/esa/cairo-2026-10.html',import.meta.url),'utf8');
  const city='القـاهـرة',month=parseEsaMonth(html,city,'2026-10');
  const d=month.days[0],afterIsha=cairoTimestamp(d.date,d.times.isha)+1;
  const n=nextPrayer([month],city,afterIsha)!;assert.equal(n.prayer,'fajr');assert.equal(n.date,'2026-10-02');
  assert.equal(nextPrayer([month],'unrelated',afterIsha),null);
  assert.equal(countdown(afterIsha+61000,afterIsha),'00:01:01');assert.equal(countdown(afterIsha,afterIsha+1),'00:00:00');
});
