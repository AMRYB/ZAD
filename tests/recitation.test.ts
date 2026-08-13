import test from 'node:test';
import assert from 'node:assert/strict';
import {recitationQueue,sleepDeadline} from '../src/core/recitation.ts';
test('native queue contains original KSU URLs only, bounds a single surah and validates requests',()=>{
  const q=recitationQueue('husary',1,5);assert.equal(q.length,3);assert.equal(q[0].aya,5);assert.equal(q.at(-1)?.aya,7);
  assert.ok(q.every(v=>v.url.startsWith('https://quran.ksu.edu.sa/ayat/mp3/Husary_64kbps/')));
  assert.equal(recitationQueue('husary',114,6).length,1);assert.throws(()=>recitationQueue('other',1,1));assert.throws(()=>recitationQueue('husary',1,8));
});
test('sleep timer accepts only bounded user options and cancels explicitly',()=>{
  assert.equal(sleepDeadline(5,1000),301000);assert.equal(sleepDeadline(0,1000),0);assert.throws(()=>sleepDeadline(-5,1000));assert.throws(()=>sleepDeadline(999,1000));
});
