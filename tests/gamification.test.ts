import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reducer,restoreState,type Action,type State} from '../src/core/model.ts';
import {achievementProgress,levelProgress,xpSummary} from '../src/core/gamification.ts';
import {sectionEntries,entrySession} from '../src/core/adhkar.ts';
const date='2026-10-24';
const act=(s:State,a:Action,today=date)=>reducer(s,a,today);
const xp=(s:State)=>xpSummary(s.gamification,date);

test('first check-in is inclusive of excused/skipped records, once per day; notes and browsing earn nothing',()=>{
  let s=initialState();s=act(s,{type:'note',date,text:'private'});s=act(s,{type:'lastRead',sura:2,aya:3});assert.equal(xp(s).total,0);
  s=act(s,{type:'prayer',date,prayer:'fajr',status:'excused'});assert.equal(xp(s).total,5);
  s=act(s,{type:'prayer',date,prayer:'dhuhr',status:'completed'});s=act(s,{type:'fast',date,status:'notFasted'});assert.equal(xp(s).total,5);assert.equal(s.gamification.events.length,1);
  assert.ok(!JSON.stringify(s.gamification).includes('private'));
});
test('undo and redo restore the same allocation across serialization without duplicate XP',()=>{
  let s=act(initialState(),{type:'prayer',date,prayer:'fajr',status:'completed'});
  s=act(s,{type:'prayer',date,prayer:'fajr',status:'unlogged'});assert.equal(xp(s).total,0);
  assert.equal(achievementProgress(s.gamification)[0].earnedOn,null);
  s=restoreState(JSON.stringify(s));s=act(s,{type:'prayer',date,prayer:'fajr',status:'completed'});
  assert.equal(xp(s).total,5);assert.equal(s.gamification.events.length,1);assert.equal(achievementProgress(s.gamification)[0].earnedOn,date);
});
test('category and global daily caps cannot be recycled by undo, repeated taps or removing a goal',()=>{
  let s=act(initialState(),{type:'planAdd',id:'p',title:'Read',target:604,deadline:date});
  for(let page=1;page<=10;page++)s=act(s,{type:'planPage',id:'p',page,completed:true});assert.equal(xp(s).total,30);
  for(let i=0;i<10;i++){s=act(s,{type:'habitAdd',id:`h${i}`,title:'Habit'});s=act(s,{type:'habitToggle',id:`h${i}`,date});}assert.equal(xp(s).total,45);
  for(let i=0;i<4;i++){s=act(s,{type:'goalAdd',id:`g${i}`,title:'Goal',target:1});s=act(s,{type:'goalStep',id:`g${i}`,change:1});}assert.equal(xp(s).total,65);
  for(const id of ['charity','parents','kinship','food']){s=act(s,{type:'devotion',action:{type:'deedSelect',id}});s=act(s,{type:'devotion',action:{type:'deedToggle',id,date}});}assert.equal(xp(s).total,80);
  s=act(s,{type:'fast',date,status:'excused'});
  for(let i=0;i<33;i++)s=act(s,{type:'devotion',action:{type:'tasbihTap',date,change:1}});assert.equal(xp(s).total,95);
  for(const e of sectionEntries('waking'))for(let i=0;i<e.repeat;i++)s=act(s,{type:'devotion',action:{type:'adhkarStep',session:entrySession(date,'waking',e),id:e.id,limit:e.repeat,change:1}});
  assert.equal(xp(s).total,100);assert.equal(s.gamification.events.find(e=>e.kind==='adhkar')!.points,5);
  s=act(s,{type:'planPage',id:'p',page:1,completed:false});assert.equal(xp(s).total,90);assert.equal(xp(s).reserved,100);
  s=act(s,{type:'planPage',id:'p',page:11,completed:true});assert.equal(xp(s).total,90);
  s=act(s,{type:'planPage',id:'p',page:1,completed:true});assert.equal(xp(s).total,100);
  assert.deepEqual(restoreState(JSON.stringify(s)),s);
});
test('legacy 0.8 migration preserves all records and awards no historical XP',()=>{
  let s=act(initialState(),{type:'note',date,text:'Keep this'});s=act(s,{type:'devotion',action:{type:'adhkarFavorite',id:'r1'}});
  s=act(s,{type:'habitAdd',id:'h',title:'Keep habit'});s=act(s,{type:'habitToggle',id:'h',date});
  const old={...s} as Record<string,unknown>;delete old.gamification;
  const restored=restoreState(JSON.stringify(old));assert.deepEqual(restored,{...s,gamification:{ruleVersion:1,events:[]}});
  assert.equal(xp(act(restored,{type:'note',date,text:'Updated'})).total,0);
  assert.equal(xp(act(restored,{type:'prayer',date:'2026-10-23',prayer:'fajr',status:'completed'})).total,0);
  assert.equal(xp(act(restored,{type:'prayer',date:'2026-10-25',prayer:'fajr',status:'completed'})).total,0);
});
test('invalid ledgers fail closed and backups retain disabled allocations',()=>{
  const s=act(initialState(),{type:'fast',date,status:'fasted'});
  for(const invalid of [null,{ruleVersion:9,events:[]},{ruleVersion:1,events:[{...s.gamification.events[0],points:999}]},{ruleVersion:1,events:[...s.gamification.events,...s.gamification.events]},{ruleVersion:1,events:[{...s.gamification.events[0],date:'2026-02-30'}]}])assert.throws(()=>restoreState(JSON.stringify({...s,gamification:invalid})));
});
test('level thresholds and progress are exact at every boundary',()=>{
  assert.equal(levelProgress(0).level,1);assert.equal(levelProgress(99).remaining,1);
  for(let n=1;n<=100;n++){const threshold=50*n*(n-1);const p=levelProgress(threshold);assert.equal(p.level,n);assert.equal(p.current,0);assert.equal(p.required,n*100);if(n>1)assert.equal(levelProgress(threshold-1).level,n-1);}
});
test('Tasbih uses daily participation, ignores adjustable targets/reset, and reverses below 33',()=>{
  let s=act(initialState(),{type:'devotion',action:{type:'tasbihSettings',target:1}});
  for(let i=0;i<32;i++)s=act(s,{type:'devotion',action:{type:'tasbihTap',date,change:1}});assert.equal(xp(s).total,0);
  s=act(s,{type:'devotion',action:{type:'tasbihTap',date,change:1}});assert.equal(xp(s).total,10);
  s=act(s,{type:'devotion',action:{type:'tasbihTap',date,change:-1}});assert.equal(xp(s).total,0);
  s=act(s,{type:'devotion',action:{type:'tasbihTap',date,change:1}});s=act(s,{type:'devotion',action:{type:'tasbihReset'}});assert.equal(xp(s).total,10);
});
test('full Adhkar section is required; reset and replay do not duplicate its reward',()=>{
  let s=initialState();const entries=sectionEntries('waking');
  for(const e of entries)for(let i=0;i<e.repeat;i++)s=act(s,{type:'devotion',action:{type:'adhkarStep',session:entrySession(date,'waking',e),id:e.id,limit:e.repeat,change:1}});
  assert.equal(xp(s).total,10);s=act(s,{type:'devotion',action:{type:'adhkarReset',session:`${date}:waking:general`}});assert.equal(xp(s).total,0);
  for(const e of entries)for(let i=0;i<e.repeat;i++)s=act(s,{type:'devotion',action:{type:'adhkarStep',session:entrySession(date,'waking',e),id:e.id,limit:e.repeat,change:1}});
  assert.equal(xp(s).total,10);assert.equal(s.gamification.events.length,1);
});
test('corrections and deletion revoke eligible goal, plan, habit and deed rewards',()=>{
  let s=act(initialState(),{type:'goalAdd',id:'g',title:'G',target:1});s=act(s,{type:'goalStep',id:'g',change:1});s=act(s,{type:'goalStep',id:'g',change:-1});assert.equal(xp(s).total,0);
  s=act(s,{type:'goalStep',id:'g',change:1});s=act(s,{type:'goalDelete',id:'g'});assert.equal(xp(s).total,0);
  s=act(s,{type:'habitAdd',id:'h',title:'H'});s=act(s,{type:'habitToggle',id:'h',date});s=act(s,{type:'habitDelete',id:'h'});assert.equal(xp(s).total,0);
  s=act(s,{type:'planAdd',id:'p',title:'P',target:2,deadline:date});s=act(s,{type:'planPage',id:'p',page:1,completed:true});s=act(s,{type:'planDelete',id:'p'});assert.equal(xp(s).total,0);
  s=act(s,{type:'devotion',action:{type:'deedSelect',id:'charity'}});s=act(s,{type:'devotion',action:{type:'deedToggle',id:'charity',date}});s=act(s,{type:'devotion',action:{type:'deedToggle',id:'charity',date}});assert.equal(xp(s).total,0);
});
test('achievements have deterministic earned dates and streaks; old corrections update them',()=>{
  let s=initialState();for(const d of ['2026-10-23','2026-10-24','2026-10-25'])s=act(s,{type:'fast',date:d,status:'excused'},d);
  const badges=achievementProgress(s.gamification);assert.equal(badges.find(b=>b.id==='days-3')!.earnedOn,'2026-10-25');assert.equal(badges.find(b=>b.id==='streak-3')!.earnedOn,'2026-10-25');
  assert.deepEqual(achievementProgress(restoreState(JSON.stringify(s)).gamification),badges);
  s=act(s,{type:'fast',date:'2026-10-24',status:'unlogged'},'2026-10-26');assert.equal(achievementProgress(s.gamification).find(b=>b.id==='streak-3')!.earnedOn,null);
  s=act(s,{type:'fast',date:'2026-10-24',status:'excused'},'2026-10-26');assert.equal(xpSummary(s.gamification,'2026-10-26').total,15);assert.equal(s.gamification.events.length,3);
});
