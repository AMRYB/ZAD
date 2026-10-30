import test from 'node:test';
import assert from 'node:assert/strict';
import {QiblaSession} from '../src/core/qibla-session.ts';
test('Permission-dialog app-state transitions do not cancel the requested initial measurement',()=>{
  const run=new QiblaSession(),id=run.begin();run.requestingPermission(id);assert.equal(run.pauseForAppState(),false);assert.equal(run.valid(id),true);run.permissionComplete(id);assert.equal(run.pauseForAppState(),true);assert.equal(run.valid(id),false);
});
test('Blur/Stop invalidates prompts and old permission completion cannot change a newer run',()=>{
  const run=new QiblaSession(),old=run.begin();run.requestingPermission(old);run.cancel();assert.equal(run.valid(old),false);const next=run.begin();run.requestingPermission(next);run.permissionComplete(old);assert.equal(run.pauseForAppState(),false);run.permissionComplete(next);run.cancel();assert.equal(run.valid(next),false);
});
