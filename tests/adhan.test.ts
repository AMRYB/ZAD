import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseEsaMonth,esaTime,esaForm,cairoTimestamp,prayerEvents} from '../src/core/adhan.ts';
import {initialState,restoreState,reducer} from '../src/core/model.ts';
import {esaCities,cityName} from '../src/data/esa-cities.ts';
const fixture=()=>readFile(new URL('./fixtures/esa/cairo-2026-10.html',import.meta.url),'utf8');
test('City choices retain all 82 observed option values with Arabic and English display names',async()=>{
  const html=await readFile(new URL('./fixtures/esa/cities.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/<option[^>]*value="([^"]+)"/g)].map(m=>m[1]).filter(v=>v!=='كل المدن');
  assert.deepEqual(esaCities.map(c=>c.id),ids);assert.equal(new Set(ids).size,82);
  assert.equal(cityName(esaCities[0],'en'),'Cairo');assert.equal(cityName(esaCities[0],'ar'),'القاهرة');
});
test('ESA captured full month retains authoritative dates, six times and DST change',async()=>{
  const m=parseEsaMonth(await fixture(),'القـاهـرة','2026-10',123);
  assert.equal(m.days.length,31);assert.equal(m.days[22].times.fajr,'05:35');assert.equal(m.days[29].times.fajr,'04:39');
  assert.equal(m.days[29].times.dhuhr,'11:39');assert.equal(m.days[23].times.isha,'19:33');
  assert.equal(m.fetchedAt,123);assert.equal(m.city,'القـاهـرة');
});
test('ESA fails closed for wrong year/city, missing and duplicate days, invalid time',async()=>{
  const html=await fixture();assert.throws(()=>parseEsaMonth(html,'القـاهـرة','2027-10'));
  assert.throws(()=>parseEsaMonth(html,'الأسكندرية','2026-10'));
  assert.throws(()=>parseEsaMonth(html.replace('2026-10-23','2026-10-22'),'القـاهـرة','2026-10'));
  assert.throws(()=>parseEsaMonth(html.replace('5:35 ص','5:75 ص'),'القـاهـرة','2026-10'));
  assert.equal(esaTime('12:39 م'),'12:39');assert.equal(esaTime('12:02 ص'),'00:02');assert.equal(esaTime('٥:٢ ص'),'05:02');
});
test('Cairo conversion follows actual DST on either side without device timezone',()=>{
  assert.equal(new Date(cairoTimestamp('2026-10-29','05:39')).toISOString(),'2026-10-29T02:39:00.000Z');
  assert.equal(new Date(cairoTimestamp('2026-10-30','04:39')).toISOString(),'2026-10-30T02:39:00.000Z');
});
test('Only five prayer alarms and ten-minute reminders, no sunrise, duplicates or past events',async()=>{
  const m=parseEsaMonth(await fixture(),'القـاهـرة','2026-10');
  const now=cairoTimestamp('2026-10-31','00:00');const events=prayerEvents([m,m],now,true);
  assert.equal(events.length,10);assert.ok(events.every(e=>e.prayer!=='sunrise'&&e.at>now));
  for(const e of events.filter(e=>e.reminder))assert.equal(events.find(a=>a.id===e.id.replace(':reminder',''))!.at-e.at,600000);
  assert.equal(prayerEvents([m],now,false).length,5);
});
test('Old backups migrate Adhan disabled; invalid city and enabled-without-city rejected',()=>{
  const legacy=JSON.parse(JSON.stringify(initialState()));delete legacy.adhan;
  assert.deepEqual(restoreState(JSON.stringify(legacy)).adhan,{city:null,enabled:false,reminder:true});
  const state=initialState();assert.equal(reducer(state,{type:'adhanSettings',value:{city:'unknown',enabled:true,reminder:true}}),state);
  legacy.adhan={city:null,enabled:true,reminder:true};assert.throws(()=>restoreState(JSON.stringify(legacy)));
});
test('WebForms request uses only source form fields and bounded validated selectors',()=>{
  const html='<input name="__VIEWSTATE" value="temporary"><input name="__EVENTVALIDATION" value="temporary"><input name="private" value="excluded">';
  const form=esaForm(html,'القـاهـرة','2026-10');assert.equal(form.get('ctl00$placeholder1$DropDownList2'),'10');assert.equal(form.has('private'),false);
  assert.throws(()=>esaForm(html,'fake','2026-10'));assert.throws(()=>esaForm(html,'القـاهـرة','2026-13'));
});
