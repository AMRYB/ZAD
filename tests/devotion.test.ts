import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reducer,restoreState} from '../src/core/model.ts';
import {adhkarSession,initialDevotion,reduceDevotion,roundProgress,validReminder} from '../src/core/devotion.ts';

test('Tasbih keeps per-phrase counts, round boundaries and day totals through reset and restore',()=>{
  let s=initialDevotion();for(let i=0;i<33;i++)s=reduceDevotion(s,{type:'tasbihTap',date:'2026-10-24',change:1});
  assert.deepEqual(roundProgress(s.tasbih.counts.subhan,33),{current:33,rounds:1});
  s=reduceDevotion(s,{type:'tasbihSettings',phrase:'hamd',haptics:false});s=reduceDevotion(s,{type:'tasbihTap',date:'2026-10-24',change:1});
  s=reduceDevotion(s,{type:'tasbihReset'});assert.equal(s.tasbih.daily['2026-10-24'],34);assert.equal(s.tasbih.counts.subhan,33);assert.equal(s.tasbih.counts.hamd,0);
  const state={...initialState(),devotion:s};assert.deepEqual(restoreState(JSON.stringify(state)),state);
  assert.equal(reduceDevotion(s,{type:'tasbihTap',date:'2026-10-24',change:-1}),s);
  assert.equal(reduceDevotion(s,{type:'tasbihSettings',target:0}),s);assert.equal(reduceDevotion(s,{type:'tasbihSettings',target:1.5}),s);
});
test('Older backups migrate with notifications disabled and corrupted devotional records fail closed',()=>{
  const old=JSON.parse(JSON.stringify(initialState()));delete old.devotion;assert.deepEqual(restoreState(JSON.stringify(old)).devotion,initialDevotion());
  for(const change of [(s:ReturnType<typeof initialState>)=>s.devotion.tasbih.counts.subhan=-1,(s:ReturnType<typeof initialState>)=>s.devotion.tasbih.target=0,(s:ReturnType<typeof initialState>)=>s.devotion.reminders.deeds.times=['25:00','15:00','20:00']]){
    const s=initialState();change(s);assert.throws(()=>restoreState(JSON.stringify(s)));
  }
});
test('Adhkar progress is bounded and isolated by date, section and prayer; favorites and position survive',()=>{
  let s=initialState();const session=adhkarSession('2026-10-24','prayer','fajr');
  for(let i=0;i<5;i++)s=reducer(s,{type:'devotion',action:{type:'adhkarStep',session,id:'r86-istighfar',limit:3,change:1}});
  assert.equal(s.devotion.adhkar.counts[session]['r86-istighfar'],3);assert.equal(s.devotion.adhkar.counts[adhkarSession('2026-10-24','prayer','asr')],undefined);
  s=reducer(s,{type:'devotion',action:{type:'adhkarFavorite',id:'r86-istighfar'}});s=reducer(s,{type:'devotion',action:{type:'adhkarPosition',category:'prayer',id:'r86-istighfar'}});
  assert.deepEqual(restoreState(JSON.stringify(s)).devotion.adhkar,s.devotion.adhkar);assert.throws(()=>adhkarSession('2026-02-30','morning'));
  assert.equal(reduceDevotion(s.devotion,{type:'adhkarStep',session:'bad',id:'r86',limit:3,change:1}),s.devotion);
});
test('Good deeds are opt-in, custom titles are bounded and daily toggles do not duplicate or erase history',()=>{
  let s=initialDevotion();assert.deepEqual(s.deeds.selected,[]);assert.equal(reduceDevotion(s,{type:'deedToggle',id:'charity',date:'2026-10-24'}),s);
  s=reduceDevotion(s,{type:'deedSelect',id:'charity'});s=reduceDevotion(s,{type:'deedToggle',id:'charity',date:'2026-10-24'});s=reduceDevotion(s,{type:'deedSelect',id:'charity'});
  assert.deepEqual(s.deeds.days['2026-10-24'],['charity']);assert.deepEqual(s.deeds.selected,[]);
  s=reduceDevotion(s,{type:'deedAdd',id:'custom-a',title:'  A private act  '});assert.equal(s.deeds.custom[0].title,'A private act');assert.deepEqual(s.deeds.selected,['custom-a']);
  assert.equal(reduceDevotion(s,{type:'deedAdd',id:'custom-a',title:'Duplicate'}),s);assert.equal(reduceDevotion(s,{type:'deedSelect',id:'__proto__'}),s);
});
test('Daily reminders require explicit opt-in and three distinct valid local clock times',()=>{
  const s=initialDevotion();assert.equal(s.reminders.deeds.enabled,false);assert.equal(s.reminders.adhkar.enabled,false);
  assert.equal(validReminder({enabled:true,times:['09:00','15:00','20:00']}),true);
  for(const times of [['09:00','09:00','20:00'],['9:00','15:00','20:00'],['24:00','15:00','20:00'],['09:00']])assert.equal(validReminder({enabled:true,times}),false);
});
