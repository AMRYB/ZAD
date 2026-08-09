import test from 'node:test';
import assert from 'node:assert/strict';
import {KSU_RECITERS,KSU_TAFSIRS} from '../src/data/ksu-readers.ts';
import {recitationUrl,tafsirUrl} from '../src/core/ksu.ts';
import {relayTarget} from '../src/core/ksu-relay.ts';

test('KSU catalogue has unique Hafs recordings and observed Arabic tafsir IDs',()=>{
  assert.equal(KSU_RECITERS.length,41);
  assert.equal(new Set(KSU_RECITERS.map(r=>r.id)).size,KSU_RECITERS.length);
  assert.deepEqual(KSU_TAFSIRS.map(t=>t.id),['sa3dy','baghawy','katheer','qortoby','tabary']);
  assert.ok(KSU_RECITERS.every(r=>!r.folder.startsWith('warsh_')));
});
test('selected reciter changes only the allowlisted KSU recording folder',()=>{
  assert.equal(recitationUrl('afasy',1,4),'https://quran.ksu.edu.sa/ayat/mp3/Alafasy_64kbps/001004.mp3');
  assert.equal(recitationUrl('minshawy',114,6),'https://quran.ksu.edu.sa/ayat/mp3/Minshawy_Murattal_128kbps/114006.mp3');
  for(const id of ['../secret','https://example.com','husary.w','khaleefa',''])assert.throws(()=>recitationUrl(id,1,1));
  assert.throws(()=>recitationUrl('afasy',1,8));
});
test('tafsir relay accepts each observed author and rejects arbitrary author/destination',()=>{
  for(const author of KSU_TAFSIRS){const url=tafsirUrl(author.id,2,255);assert.equal(new URL(url).searchParams.get('author'),author.id);assert.equal(relayTarget(new URL(url).searchParams),url);}
  assert.throws(()=>tafsirUrl('unknown',1,1));
  assert.throws(()=>relayTarget(new URLSearchParams('ui=pc&do=tafsir&author=katheer&sura=1&aya=1&url=https://example.com')));
});
