import test from 'node:test';
import assert from 'node:assert/strict';
import {ReaderGesture,containTransform,swipePage,sidewaysCardDrag} from '../src/core/reader-gestures.ts';
const bounds={width:400,height:600,pageWidth:400,pageHeight:600};
test('pinch anchors the source pixel, clamps scale, and never flips after lifting one finger',()=>{
  const g=new ReaderGesture();g.configure(bounds);
  g.begin([{x:150,y:300},{x:250,y:300}]);g.update([{x:100,y:300},{x:300,y:300}]);
  assert.deepEqual(g.value,{zoom:2,x:0,y:0});
  g.update([{x:300,y:300}]);g.update([{x:390,y:300}]);
  assert.equal(g.value.x,90);assert.equal(g.finish(true,20).delta,0);
  g.begin([{x:100,y:300},{x:200,y:300}]);g.update([{x:-200,y:300},{x:500,y:300}]);
  assert.equal(g.value.zoom,3);
});
test('off-center pinch keeps its focal pixel fixed and panning stays inside page edges',()=>{
  const g=new ReaderGesture();g.configure(bounds);
  g.begin([{x:225,y:250},{x:275,y:250}]);g.update([{x:200,y:250},{x:300,y:250}]);
  assert.deepEqual(g.value,{zoom:2,x:-50,y:50});
  assert.deepEqual(containTransform({zoom:2,x:999,y:-999},bounds),{zoom:2,x:200,y:-300});
  g.begin([{x:200,y:300}]);g.update([{x:1000,y:1000}]);
  assert.deepEqual(g.value,{zoom:2,x:200,y:300});assert.equal(g.finish(true,30).delta,0);
});
test('page swipes respect direction, intent, cancellation and Quran boundaries',()=>{
  assert.equal(swipePage(180,10,400,true,1),1);assert.equal(swipePage(-180,10,400,true,2),-1);
  assert.equal(swipePage(-180,10,400,false,1),1);
  assert.equal(swipePage(-180,10,400,true,1),0);assert.equal(swipePage(180,10,400,true,604),0);
  assert.equal(swipePage(30,0,400,true,10),0);assert.equal(swipePage(180,200,400,true,10),0);
  assert.equal(swipePage(180,0,400,true,10,true),0);
  const g=new ReaderGesture();g.configure(bounds);g.begin([{x:40,y:250}]);g.update([{x:240,y:260}]);
  assert.equal(g.finish(true,5,true).delta,0);
});
test('touch-count transitions rebase without jumping and reset clears stale pan',()=>{
  const g=new ReaderGesture();g.configure(bounds,2);g.begin([{x:100,y:200}]);g.update([{x:130,y:240}]);
  const before={...g.value};g.update([{x:130,y:240},{x:230,y:240}]);assert.deepEqual(g.value,before);
  g.update([{x:130,y:240}]);assert.deepEqual(g.value,before);
  g.configure({width:800,height:300,pageWidth:200,pageHeight:300});assert.deepEqual(g.value,{zoom:1,x:0,y:0});
});

test('card swipes cycle in either lateral direction and reject short or vertical drags',()=>{
  assert.equal(sidewaysCardDrag(12,2),true);
  assert.equal(sidewaysCardDrag(-12,2),true);
  assert.equal(sidewaysCardDrag(12,2,true),false);
  assert.equal(sidewaysCardDrag(80,20,true),true);
  assert.equal(sidewaysCardDrag(-80,-20,true),true);
  assert.equal(sidewaysCardDrag(0,-100,true),false);
  assert.equal(sidewaysCardDrag(70,65,true),false);
  assert.equal(sidewaysCardDrag(0,0),false);
});
