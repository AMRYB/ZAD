import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {compareRecall,recallWords,validRecallRange,type RecallAttempt} from '../src/core/written-recall.ts';
import {initialState,reducer,restoreState} from '../src/core/model.ts';
import {applyCloud,cloudDocument,mergeGuest} from '../src/core/cloud.ts';
import {quran} from '../src/data/quran.ts';
const file=(name:string)=>readFileSync(new URL(`../${name}`,import.meta.url));
const manifest=JSON.parse(file('src/data/recall-source.json').toString());
const verses=JSON.parse(file('assets/quran-reference/kfgqpc_hafs_v30.json').toString());
const attempt=(id='review-1'):RecallAttempt=>({id,date:'2026-10-30',surah:1,ayah:1,matched:4,total:4,letterErrors:0,missing:0,extra:0,hinted:false});
const range={surah:1,from:1,to:7,current:1,completed:false};

test('official reference bytes match pinned hashes and all 6236 ayahs match KSU numbering',()=>{
  for(const [name,key] of [['json','jsonSha256'],['ttf','fontSha256']])assert.equal(createHash('sha256').update(file(`assets/quran-reference/kfgqpc_hafs_v30.${name}`)).digest('hex'),manifest[key]);
  assert.equal(verses.length,6236);assert.equal(new Set(verses.map((v:any)=>v.sura_no)).size,114);
  for(let s=1;s<=114;s++){const rows=verses.filter((v:any)=>v.sura_no===s);assert.equal(rows.length,quran.Sura[s]!.ayas);rows.forEach((v:any,i:number)=>{assert.equal(v.aya_no,i+1);assert.equal(v.id,quran.Sura[s]!.start+i+1);});}
});

test('every official ordinary and Uthmanic ayah passes unchanged against its own reference',()=>{
  for(const v of verses){assert.equal(compareRecall(v.aya_text_emlaey,v.aya_text_unicode,v.aya_text_emlaey).correct,true,`${v.sura_no}:${v.aya_no} ordinary`);assert.equal(compareRecall(v.aya_text_emlaey,v.aya_text_unicode,v.aya_text_unicode).correct,true,`${v.sura_no}:${v.aya_no} Uthmanic`);}
});

test('diacritics, punctuation, spacing, presentation forms and wasla are tolerated',()=>{
  const v=verses[0];assert.equal(compareRecall(v.aya_text_emlaey,v.aya_text_unicode,'  بِسْمِ ٱللَّهِ، الرَّحْمَٰنِ   الرَّحِيمِ ١ ').correct,true);
  assert.deepEqual(recallWords('ﻻ إِلَهَ إِلاّ ٱللَّهُ'),['لا','إله','إلا','الله']);
});

test('hamza, alif maqsura and ta marbuta are never silently accepted as other letters',()=>{
  for(const [ref,wrong] of [['إياك','اياك'],['أحد','احد'],['آمن','امن'],['على','علي'],['الجنة','الجنه']]){const result=compareRecall(ref,ref,wrong);assert.equal(result.correct,false);assert.equal(result.letterErrors,1);assert.equal(result.words[0].kind,'changed');}
  assert.equal(compareRecall('إياك','إياك','أياك').correct,false);
  assert.equal(compareRecall('أحد','أحد','أحد').correct,true);
});

test('alignment identifies missing/extra/repeated words and exact letter differences',()=>{
  const v=verses[0],missing=compareRecall(v.aya_text_emlaey,v.aya_text_unicode,'بسم الله الرحيم');assert.equal(missing.missing,1);assert.equal(missing.words.find(w=>w.kind==='missing')?.expected,'الرحمن');
  const extra=compareRecall(v.aya_text_emlaey,v.aya_text_unicode,'بسم الله الله الرحمن الرحيم');assert.equal(extra.extra,1);
  const changed=compareRecall('الرحيم','الرحيم','الرحيمم');assert.equal(changed.letterErrors,1);assert.equal(changed.words[0].letters.filter(l=>l.kind==='extra').length,1);
  assert.equal(compareRecall('الله','الله','').correct,false);assert.equal(compareRecall('الله','الله','Allah').correct,false);
  assert.throws(()=>compareRecall('الله','الله','ا'.repeat(6001)),/ANSWER_TOO_LONG/);assert.throws(()=>compareRecall('الله','الله',Array(301).fill('الله').join(' ')),/WORD_LIMIT/);
});

test('old snapshots migrate without changing existing data; invalid recall fails closed',()=>{
  const old:any=initialState();old.days['2026-10-30']={fast:'fasted',prayers:{},note:'Synthetic retained note'};delete old.recall;
  const state=restoreState(JSON.stringify(old));assert.deepEqual(state.recall,{last:null,attempts:[]});assert.equal(state.days['2026-10-30'].note,old.days['2026-10-30'].note);
  for(const invalid of [{...range,surah:0},{...range,to:8},{...range,current:0},{...range,from:2,to:1}])assert.equal(validRecallRange(invalid),false);
  assert.throws(()=>restoreState(JSON.stringify({...state,recall:{last:null,attempts:[{...attempt(),answer:'must not persist'}]}})),/INVALID_STORAGE/);
});

test('only summaries persist, replay is ignored, history bounded and no XP is awarded',()=>{
  let state=reducer(initialState(),{type:'recallRange',value:range});state=reducer(state,{type:'recallAttempt',value:attempt()});assert.equal(state.recall.attempts.length,1);
  assert.equal(reducer(state,{type:'recallAttempt',value:attempt()}),state);assert.equal(reducer(state,{type:'recallAttempt',value:{...attempt('wrong-ayah'),ayah:2}}),state);
  assert.equal(reducer(state,{type:'recallAttempt',value:{...attempt('private'),answer:'PRIVATE-TYPED-TEXT'} as RecallAttempt}),state);
  for(let i=0;i<105;i++)state=reducer(state,{type:'recallAttempt',value:attempt(`review-${i+2}`)});
  assert.equal(state.recall.attempts.length,100);assert.deepEqual(state.gamification,initialState().gamification);assert.deepEqual(restoreState(JSON.stringify(state)),state);
  const next=reducer(state,{type:'recallRange',value:{...range,current:7,completed:true}});assert.equal(next.recall.last?.completed,true);
});

test('optional cloud sync excludes recall; applying remote keeps local results and guest import deduplicates',()=>{
  let local=reducer(initialState(),{type:'recallRange',value:range});local=reducer(local,{type:'recallAttempt',value:attempt()});
  assert.deepEqual(JSON.parse(cloudDocument(local)).recall,{last:null,attempts:[]});assert.equal(cloudDocument(local).includes('review-1'),false);
  assert.deepEqual(applyCloud(local,initialState()).recall,local.recall);
  const merged=mergeGuest(initialState(),local);assert.deepEqual(merged.recall,local.recall);assert.deepEqual(mergeGuest(merged,local).recall,local.recall);
});
