import test from 'node:test';
import assert from 'node:assert/strict';
import {sheetBounds,sheetDragHeight,sheetReleaseHeight,shouldDragSheet} from '../src/core/reader-sheet.ts';

test('sheet follows the finger, keeps a chosen intermediate height and respects viewport bounds',()=>{
  const b=sheetBounds(844,24);
  assert.equal(b.max,820);
  assert.equal(sheetDragHeight(600,-120,b),720);
  assert.equal(sheetDragHeight(600,120,b),480);
  assert.equal(sheetReleaseHeight(480,0,b),480);
  assert.equal(sheetDragHeight(600,-999,b),820);
  assert.equal(sheetDragHeight(600,999,b),0);
  const landscape=sheetBounds(390,0);
  assert.ok(landscape.min<landscape.initial&&landscape.initial<landscape.max);
});
test('sheet dismisses a deliberate downward pull and restores a cancelled drag',()=>{
  const b=sheetBounds(844);
  assert.equal(sheetReleaseHeight(100,0,b),0);
  assert.equal(sheetReleaseHeight(b.min-10,1.1,b),0);
  assert.equal(sheetReleaseHeight(b.min-10,0,b),b.min);
  assert.equal(sheetReleaseHeight(0,2,b,true),b.min);
  assert.equal(sheetReleaseHeight(b.max+20,0,b),b.max);
});
test('sheet drag arbitrates with list scrolling and leaves taps and horizontal movement alone',()=>{
  assert.equal(shouldDragSheet(0,40,0,600,820),true);
  assert.equal(shouldDragSheet(0,-40,0,600,820),true);
  assert.equal(shouldDragSheet(0,-40,0,820,820),false);
  assert.equal(shouldDragSheet(0,40,150,820,820),false);
  assert.equal(shouldDragSheet(0,40,150,820,820,true),true);
  assert.equal(shouldDragSheet(40,10,0,600,820,true),false);
  assert.equal(shouldDragSheet(0,4,0,600,820,true),false);
});
