"""Import the exact official Hafs archive for the user-authorized written-recall feature."""
import argparse,hashlib,json
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]
ARCHIVE_SHA='227e6b1564d980f2bd09c2c35ebfb0330ac268c79a7c247cd1ab665bc635f245'
JSON_ENTRY='kfgqpc_hafs_v30-data/kfgqpc_hafs_v30.json'
FONT_ENTRY='kfgqpc_hafs_v30-font/kfgqpc_hafs_v30.ttf'
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--archive',type=Path,required=True);args=parser.parse_args()
raw=args.archive.read_bytes();assert hashlib.sha256(raw).hexdigest()==ARCHIVE_SHA,'Official published archive checksum mismatch'
with zipfile.ZipFile(args.archive) as z:
 data=z.read(JSON_ENTRY);font=z.read(FONT_ENTRY)
rows=json.loads(data.decode('utf-8-sig'));assert len(rows)==6236
counts={};last=(0,0)
for number,row in enumerate(rows,1):
 assert row['id']==number and 1<=row['sura_no']<=114
 key=(row['sura_no'],row['aya_no']);assert key>last;last=key
 counts[row['sura_no']]=counts.get(row['sura_no'],0)+1;assert counts[row['sura_no']]==row['aya_no']
 assert all(isinstance(row[k],str) and row[k].strip() for k in ['aya_text_unicode','aya_text_emlaey'])
assert len(counts)==114
target=ROOT/'assets/quran-reference';target.mkdir(parents=True,exist_ok=True)
(target/'kfgqpc_hafs_v30.json').write_bytes(data)
(target/'kfgqpc_hafs_v30.ttf').write_bytes(font)
manifest={'publisher':'King Fahd Glorious Quran Printing Complex','landingPage':'https://qurancomplex.gov.sa/quran-dev/','archiveUrl':'https://download.qurancomplex.gov.sa/resources_dev/kfgqpc_hafs_v30.zip','publishedUpdate':'15.0','publishedDate':'2026-09-30','archiveSha256':ARCHIVE_SHA,'archiveBytes':len(raw),'jsonEntry':JSON_ENTRY,'jsonSha256':hashlib.sha256(data).hexdigest(),'jsonBytes':len(data),'fontEntry':FONT_ENTRY,'fontSha256':hashlib.sha256(font).hexdigest(),'fontBytes':len(font),'surahs':114,'ayahs':6236,'purpose':'Written recall only; user explicitly requested official Saudi text on2026-10-30','endorsement':False,'originalFilesUnmodified':True}
(ROOT/'src/data/recall-source.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('PASS:6236 verses/114 chapters; original JSON/font copied without text transformations; published SHA256 matched')
