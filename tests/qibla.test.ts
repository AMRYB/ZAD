import test from 'node:test';
import assert from 'node:assert/strict';
import {angleDelta,degrees,KAABA,qiblaDirection,reliableQibla} from '../src/core/qibla.ts';
test('WGS84 Qibla agrees with independently generated GeographicLib Python reference fixtures',()=>{
  // GeographicLib Python2.1 inverse, fixed Kaaba21.422487/39.826206; no user coordinates.
  for(const [lat,lon,bearing,distance] of [[30.0444,31.2357,135.982385644858,1285597.033057339],[51.5074,-.1278,118.868407810755,4794757.467481786],[40.7128,-74.006,58.3960355387303,10323917.350940257],[-33.8688,151.2093,277.318818855245,13236946.774947375]]){
    const result=qiblaDirection(lat,lon);assert.ok(Math.abs(result.bearing-bearing)<1e-8);assert.ok(Math.abs(result.distance-distance)<.001);
  }
});
test('Qibla rejects invalid coordinates and handles Kaaba, dateline and antipodal positions without NaN',()=>{
  for(const p of [[91,0],[0,181],[NaN,0],[0,Infinity]])assert.throws(()=>qiblaDirection(p[0],p[1]));
  assert.equal(qiblaDirection(KAABA.latitude,KAABA.longitude).distance,0);
  for(const p of [[0,180],[0,-180],[-KAABA.latitude,KAABA.longitude-180]])assert.ok(Number.isFinite(qiblaDirection(p[0],p[1]).bearing));
});
test('North crossing takes the short rotation in both directions',()=>{
  assert.equal(angleDelta(1,359),2);assert.equal(angleDelta(359,1),-2);assert.equal(angleDelta(135,495),0);assert.equal(degrees(-1),359);
});
test('Alignment requires fresh true north, high calibration and suitable unmocked location',()=>{
  const good={accuracy:10,compass:3,trueHeading:136,distance:1285597,mocked:false,age:1000};assert.equal(reliableQibla(good),true);
  for(const change of [{accuracy:null},{accuracy:101},{accuracy:-1},{compass:2},{trueHeading:-1},{trueHeading:NaN},{distance:20},{distance:20000000},{mocked:true},{age:60001},{age:-1}])assert.equal(reliableQibla({...good,...change}),false);
});
