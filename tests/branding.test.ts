import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {launcherAliases}=require('../plugins/with-day-night-brand.cjs');
test('launcher aliases keep stable deep links, declare one default icon, and remain idempotent',()=>{
  const main={action:[{$:{'android:name':'android.intent.action.MAIN'}}],category:[{$:{'android:name':'android.intent.category.LAUNCHER'}}]};
  const view={action:[{$:{'android:name':'android.intent.action.VIEW'}}],category:[{$:{'android:name':'android.intent.category.BROWSABLE'}}]};
  const data={application:[{activity:[{$:{'android:name':'.MainActivity'},'intent-filter':[main,view]}]}]};
  const first=launcherAliases(structuredClone(data),'com.example.zad');assert.deepEqual(first.application[0].activity[0]['intent-filter'],[view]);
  assert.equal(first.application[0]['activity-alias'].length,2);assert.equal(first.application[0]['activity-alias'].filter((a:{$:Record<string,string>})=>a.$['android:enabled']==='true').length,1);
  assert.ok(first.application[0]['activity-alias'].every((a:{$:Record<string,string>})=>a.$['android:targetActivity']==='com.example.zad.MainActivity'));
  assert.deepEqual(launcherAliases(structuredClone(first),'com.example.zad'),first);
  assert.throws(()=>launcherAliases({application:[{}]},'com.example.zad'),/MAIN_ACTIVITY_MISSING/);
});
