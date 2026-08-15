import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const plugin=require('../plugins/with-branded-audio.cjs') as {files:string[];patchText:(name:string,text:string)=>string};
test('pinned Android media patch is repeatable and rejects drift rather than silently applying to a changed SDK',async()=>{
  const base=path.join(path.dirname(require.resolve('expo-audio/package.json')),'android/src/main/java/expo/modules/audio');
  for(const name of plugin.files){
    const input=await readFile(path.join(base,name),'utf8'),patched=plugin.patchText(name,input);
    assert.equal(plugin.patchText(name,patched),patched);
    assert.throws(()=>plugin.patchText(name,input+'\n// unexpected upstream change\n'),/SOURCE_CHANGED/);
  }
  assert.throws(()=>plugin.patchText('unrelated.kt',''),/UNKNOWN_AUDIO_PATCH/);
});
