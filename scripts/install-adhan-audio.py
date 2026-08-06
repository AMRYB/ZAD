"""Validate or locally import the exact private-build Adhan recordings; no media is published."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, help='Folder of already prepared, exactly matching <clip-id>.mp3 files')
args = parser.parse_args()
destination = root / 'assets/private/adhan'
source = args.source.resolve() if args.source else destination
catalogue = json.loads((root / 'src/data/adhan-audio.json').read_text(encoding='utf-8'))
for key, clip in catalogue['clips'].items():
    candidate = source / (key + '.mp3')
    if not candidate.is_file() or candidate.stat().st_size != clip['bytes']:
        raise SystemExit('Missing or different recording: ' + key)
    if hashlib.sha256(candidate.read_bytes()).hexdigest() != clip['sha256']:
        raise SystemExit('Recording hash differs: ' + key)
if args.source and source != destination.resolve():
    destination.mkdir(parents=True, exist_ok=True)
    for key in catalogue['clips']:
        temporary = destination / (key + '.tmp')
        shutil.copyfile(source / (key + '.mp3'), temporary)
        temporary.replace(destination / (key + '.mp3'))
print('PASS: all twelve source-pinned private recordings match the catalogue')
