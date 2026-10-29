import test from 'node:test';
import assert from 'node:assert/strict';
import {TasbihPull} from '../src/core/tasbih-pull.ts';
test('Single-finger pulls follow either horizontal direction and count only once',()=>{
  const p=new TasbihPull();for(const dx of [-90,90]){p.begin();assert.equal(p.capture(dx,2,1),true);p.update(dx,2,1);assert.ok(p.progress>0&&p.progress<.55);assert.equal(p.direction,dx>0?-1:1);assert.equal(p.finish().count,true);assert.equal(p.finish().count,false);}
});
test('Downward pulls work while small drags, upward scrolls, pinches and cancellation do not count',()=>{
  const p=new TasbihPull();p.begin();p.update(1,70,1);assert.equal(p.finish().count,true);
  for(const [x,y,touches,cancelled] of [[10,0,1,false],[0,-80,1,false],[100,0,2,false],[80,0,1,true]] as const){p.begin();p.update(x,y,touches);assert.equal(p.finish(cancelled).count,false);}
  assert.equal(p.capture(0,-80,1),false);p.begin();p.update(80,0,1);p.update(80,0,2);p.update(90,0,1);assert.equal(p.finish().count,false);
});
