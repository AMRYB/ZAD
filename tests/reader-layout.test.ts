import test from 'node:test';
import assert from 'node:assert/strict';
import {pageFrame} from '../src/core/reader-layout.ts';
import {hafsRects} from '../src/core/ksu.ts';

test('complete-page mode contains the entire Mushaf in portrait landscape and desktop viewports',()=>{
  for(const [w,h] of [[374,480],[390,650],[760,220],[1200,800]]){
    const frame=pageFrame(w,h,'page');assert.ok(frame.width<=w+.0001);assert.ok(frame.height<=h+.0001);
    assert.ok(Math.abs(frame.width/frame.height-456/672)<.00001);
  }
});
test('width mode and zoom scale the original image and overlay geometry uniformly',()=>{
  const fit=pageFrame(390,350,'width');assert.equal(fit.width,390);assert.ok(fit.height>350);
  const zoom=pageFrame(390,350,'width',2);assert.equal(zoom.width,fit.width*2);
  const [rect]=hafsRects(1,{'1_1':[245,295]});
  assert.equal(rect.width*zoom.scale,(rect.width*fit.scale)*2);
  assert.deepEqual(pageFrame(0,300,'page'),{width:0,height:0,scale:0});
  assert.throws(()=>pageFrame(300,300,'page',0));
});
