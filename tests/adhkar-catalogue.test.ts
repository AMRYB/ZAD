import test from 'node:test';
import assert from 'node:assert/strict';
import {adhkarEntries,adhkarSource,categoryInfo,entrySession,sectionEntries} from '../src/core/adhkar.ts';
import {initialState,restoreState} from '../src/core/model.ts';
import {initialDevotion,reduceDevotion} from '../src/core/devotion.ts';
import {personalReminders} from '../src/core/personal-reminders.ts';
test('Risala catalogue has complete nontruncated text, six sections and traceable source notes',()=>{
  assert.equal(adhkarSource,'https://risala.prh.gov.sa/ar/content/51');assert.equal(adhkarEntries.length,90);assert.equal(new Set(adhkarEntries.map(e=>e.id)).size,90);
  for(const c of categoryInfo)assert.ok(sectionEntries(c.id).length>=4,c.id);
  for(const e of adhkarEntries){assert.ok(e.text.length>3,e.id);assert.ok(!e.text.includes('...')&&!e.text.includes('…'),e.id);assert.ok(e.sourceNotes.length&&e.sourceParagraphs.length);assert.match(e.sourceTextSha256,/^[a-f0-9]{64}$/);assert.ok(e.repeat>=1&&e.repeat<=100);assert.ok(e.reference.ar&&e.reference.en);assert.ok(!e.text.includes('<script'));}
});
test('Evening uses source-footnote variants and morning-only/prayer-only entries stay in scope',()=>{
  assert.ok(adhkarEntries.find(e=>e.id==='r102-evening')!.text.includes('أَمْسَيْنَا'));
  assert.ok(!sectionEntries('evening').some(e=>e.id==='r125'));
  assert.ok(sectionEntries('prayer','fajr').some(e=>e.id==='r93'));assert.ok(!sectionEntries('prayer','asr').some(e=>e.id==='r93'||e.id==='r92'));
  const daily=adhkarEntries.find(e=>e.id==='r127')!;assert.equal(entrySession('2026-10-24','morning',daily),entrySession('2026-10-24','evening',daily));
});
test('Unknown dhikr, inflated repetition limits and wrong sessions fail closed',()=>{
  const s=initialDevotion();assert.equal(reduceDevotion(s,{type:'adhkarFavorite',id:'r99999'}),s);
  assert.equal(reduceDevotion(s,{type:'adhkarStep',session:'2026-10-24:prayer:fajr',id:'r86-istighfar',limit:999,change:1}),s);
  assert.equal(reduceDevotion(s,{type:'adhkarStep',session:'2026-10-24:sleep:general',id:'r86-istighfar',limit:3,change:1}),s);
  const value=initialState();value.devotion.adhkar.counts['2026-10-24:prayer:fajr']={'r86-istighfar':4};assert.throws(()=>restoreState(JSON.stringify(value)));
});
test('Reminder generation is opt-in, bounded and never includes private custom deed titles',()=>{
  let s=initialDevotion();assert.deepEqual(personalReminders(s),[]);s=reduceDevotion(s,{type:'reminders',kind:'deeds',value:{enabled:true,times:['09:00','15:00','20:00']}});assert.deepEqual(personalReminders(s),[]);
  s=reduceDevotion(s,{type:'deedAdd',id:'custom-a',title:'Private deed'});assert.equal(personalReminders(s).length,3);assert.ok(!JSON.stringify(personalReminders(s)).includes('Private deed'));
  s=reduceDevotion(s,{type:'reminders',kind:'adhkar',value:{enabled:true,times:['07:00','18:00','22:00']}});assert.equal(personalReminders(s).length,6);
  s=reduceDevotion(s,{type:'deedToggle',date:'2026-10-24',id:'custom-a'});s=reduceDevotion(s,{type:'deedArchive',id:'custom-a'});assert.equal(personalReminders(s).length,3);assert.deepEqual(s.deeds.days['2026-10-24'],['custom-a']);assert.equal(s.deeds.custom[0].archived,true);
  assert.deepEqual(restoreState(JSON.stringify({...initialState(),devotion:s})).devotion,s);
});
