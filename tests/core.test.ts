import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {addDays,assignments,dateInZone,dayDifference,normalizeDigits,seasonDay} from '../src/core/calendar.ts';
import {initialState,reducer,restoreState,totals} from '../src/core/model.ts';
import {adjacentAya,hafsRects,husaryAudio,pageImage,plainTafsir,splitTafsir,versePage} from '../src/core/ksu.ts';
import {relayTarget} from '../src/core/ksu-relay.ts';

test('KSU geometry matches all 52 captured browser rectangles',async()=>{
  const fixtures=JSON.parse(await readFile(new URL('../src/data/ksu-highlight-fixtures.json',import.meta.url),'utf8'));
  let count=0;for(const f of fixtures){assert.deepEqual(hafsRects(f.page,f.coordinates),f.dom);count+=f.dom.length;}assert.equal(count,52);
});
test('navigation at page boundaries and final Quran page',()=>{
  for(const [s,a,p] of [[1,1,1],[2,1,2],[2,5,2],[2,6,3],[2,16,3],[2,17,4],[114,6,604]])assert.equal(versePage(s,a),p);
  assert.deepEqual(adjacentAya(1,7,1),{sura:2,aya:1});assert.deepEqual(adjacentAya(114,6,1),{sura:1,aya:1});assert.deepEqual(adjacentAya(2,1,-1),{sura:1,aya:7});
});
test('KSU URL builders reject invalid verses and pages',()=>{
  assert.equal(husaryAudio(1,2),'https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/001002.mp3');
  assert.throws(()=>husaryAudio(1,8));assert.throws(()=>husaryAudio(115,1));assert.throws(()=>pageImage(605));
});
test('web relay cannot target another host, unknown operation, or duplicate parameter',()=>{
  assert.equal(relayTarget(new URLSearchParams('ui=pc&do=hilites&mosshaf=hafs&t=28&page=1')),'https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page=1');
  for(const q of ['ui=pc&do=hilites&mosshaf=hafs&t=28&page=1&url=https://example.com','ui=pc&do=delete','ui=pc&do=hilites&mosshaf=hafs&t=28&page=1&page=2'])assert.throws(()=>relayTarget(new URLSearchParams(q)));
});
test('tafsir is split without executing or displaying script contents',()=>{
  const data=splitTafsir('verse|||<p>أهلًا &amp; سلام</p><script>alert(1)</script><img src=x onerror=alert(2)>');
  assert.equal(data.verseText,'verse');assert.equal(plainTafsir(data.tafsirHtml),'أهلًا & سلام');
  assert.equal(plainTafsir('&#x627;&#1604; &lt;safe&gt;'),'ال <safe>');assert.throws(()=>splitTafsir('invalid'));
});
test('Arabic defaults independently of device language; no season is invented',()=>{const s=initialState();assert.equal(s.locale,'ar');assert.equal(s.season.start,null);assert.equal(s.onboarded,false);});
test('Arabic and Persian digits normalize consistently',()=>{assert.equal(normalizeDigits('٢٠٢٦-١٠-٢٣'),'2026-10-23');assert.equal(normalizeDigits('۶۰۴'),'604');});
test('29/30-day seasons, leap days, out-of-season boundaries and adjustment',()=>{
  assert.equal(seasonDay('2026-02-18','2026-03-18',29),29);assert.equal(seasonDay('2026-02-18','2026-03-19',29),null);assert.equal(seasonDay('2026-02-18','2026-03-19',30),30);
  assert.equal(addDays('2024-02-28',1),'2024-02-29');assert.equal(seasonDay(null,'2026-02-18',30),null);assert.equal(seasonDay('2026-02-18','2026-02-18',30,1),2);
  assert.throws(()=>addDays('2026-02-30',1));
});
test('DST and timezone travel do not change date arithmetic',()=>{
  assert.equal(dayDifference('2026-03-07','2026-03-09'),2);
  assert.equal(dateInZone(new Date('2026-03-08T04:30:00Z'),'America/New_York'),'2026-03-07');
  assert.equal(dateInZone(new Date('2026-03-08T04:30:00Z'),'Africa/Cairo'),'2026-03-08');
});
test('daily edits reconcile totals and preserve historical dates on season changes',()=>{
  let s=initialState();s=reducer(s,{type:'prayer',date:'2026-10-22',prayer:'fajr',status:'completed'});s=reducer(s,{type:'fast',date:'2026-10-22',status:'fasted'});
  assert.equal(totals(s).prayers,1);assert.equal(totals(s).fasts,1);
  s=reducer(s,{type:'prayer',date:'2026-10-22',prayer:'fajr',status:'unlogged'});assert.equal(totals(s).prayers,0);
  s=reducer(s,{type:'season',start:'2027-01-01',length:29,adjustment:0});assert.equal(s.days['2026-10-22'].fast,'fasted');
});
test('independent reading plans deduplicate pages and support undo',()=>{
  let s=initialState();for(const id of ['a','b'])s=reducer(s,{type:'planAdd',id,title:id,target:604,deadline:'2026-12-01'});
  for(let i=0;i<2;i++)s=reducer(s,{type:'planPage',id:'a',page:1,completed:true});assert.deepEqual(s.plans[0].pages,[1]);assert.deepEqual(s.plans[1].pages,[]);
  s=reducer(s,{type:'planPage',id:'b',page:1,completed:true});assert.equal(totals(s).pages,1);
  s=reducer(s,{type:'planPage',id:'a',page:1,completed:false});assert.deepEqual(s.plans[0].pages,[]);assert.deepEqual(s.plans[1].pages,[1]);
});
test('catch-up assignments use remaining pages and never divide by zero',()=>{
  assert.deepEqual(assignments([1,1,2],10,'2026-10-25','2026-10-22'),{remaining:8,days:4,perDay:2});
  assert.deepEqual(assignments([1,2],10,'2026-10-21','2026-10-22'),{remaining:8,days:1,perDay:8});
});
test('settings and records survive serialization; corrupt state fails closed',()=>{
  let s=reducer(initialState(),{type:'settings',locale:'en',theme:'dark'});s=reducer(s,{type:'note',date:'2026-10-22',text:'private'});
  assert.deepEqual(restoreState(JSON.stringify(s)),s);assert.throws(()=>restoreState('{'));assert.throws(()=>restoreState(JSON.stringify({...s,version:99})));assert.throws(()=>restoreState(JSON.stringify({...s,days:{bad:{}}})));
});
test('goals are bounded and duplicate source actions cannot create duplicate goals',()=>{
  let s=reducer(initialState(),{type:'goalAdd',id:'a',title:'Review',target:2});s=reducer(s,{type:'goalAdd',id:'a',title:'Again',target:9});assert.equal(s.goals.length,1);
  s=reducer(s,{type:'goalStep',id:'a',change:99});assert.equal(s.goals[0].progress,2);assert.equal(totals(s).goals,1);s=reducer(s,{type:'goalStep',id:'a',change:-99});assert.equal(s.goals[0].progress,0);
});
test('daily habits preserve history and can be undone without duplicate completion',()=>{
  let s=reducer(initialState(),{type:'habitAdd',id:'h',title:'Review'});s=reducer(s,{type:'habitToggle',id:'h',date:'2026-10-22'});s=reducer(s,{type:'habitToggle',id:'h',date:'2026-10-23'});
  assert.equal(s.habits[0].dates.length,2);s=reducer(s,{type:'habitToggle',id:'h',date:'2026-10-22'});assert.deepEqual(s.habits[0].dates,['2026-10-23']);
  const old={...s} as Record<string,unknown>;delete old.habits;assert.deepEqual(restoreState(JSON.stringify(old)).habits,[]);
});
