"""Verify release inputs, compiled JS sources and the private icon font without exposing secrets."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import zipfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def source_maps(value):
    if 'sources' in value:
        yield value
    for section in value.get('sections', []):
        yield from source_maps(section['map'])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--build-root', type=Path, required=True)
    parser.add_argument('--apk', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    build = args.build_root.resolve()
    marker = build / '.ramadan-build-workspace'
    assert marker.read_text().strip().lower() == str(root).lower(), 'Build workspace marker mismatch'
    inputs = []
    for directory in ['src', 'assets', 'modules']:
        inputs.extend(p for p in (root / directory).rglob('*') if p.is_file()
                      and not {'build', '.gradle', '.cxx', 'node_modules', '__pycache__'}.intersection(p.relative_to(root).parts))
    inputs.extend(root / name for name in ['package.json', 'package-lock.json', 'app.json', 'scripts/cmake-short-paths.init.gradle'])
    for path in inputs:
        relative = path.relative_to(root)
        assert path.read_bytes() == (build / relative).read_bytes(), f'Build input mismatch: {relative}'
    mapping_path = build / 'android/app/build/intermediates/sourcemaps/react/release/index.android.bundle.packager.map'
    mapping = json.loads(mapping_path.read_text(encoding='utf-8'))
    compiled = {}
    for part in source_maps(mapping):
        for name, text in zip(part['sources'], part.get('sourcesContent', [])):
            if text is not None:
                compiled[name.replace('\\', '/')] = text.replace('\r\n', '\n').strip()
    checked = []
    for relative in ['src/screens/Quran.tsx', 'src/screens/Adhan.tsx', 'src/screens/Settings.tsx',
                     'src/state/AdhanCoordinator.tsx', 'src/core/adhan.ts', 'src/core/adhan-sequence.ts', 'src/services/adhan-native.ts']:
        found = [text for name, text in compiled.items() if name.endswith(relative)]
        assert len(found) == 1 and found[0] == (root / relative).read_text(encoding='utf-8').replace('\r\n', '\n').strip(), f'Compiled JS mismatch: {relative}'
        checked.append(relative)
    with zipfile.ZipFile(args.apk) as apk:
        names = apk.namelist()
        abis = {name.split('/')[1] for name in names if name.startswith('lib/') and name.endswith('.so')}
        assert abis == {'arm64-v8a'}, f'Unexpected ABIs: {abis}'
        bundle = apk.read('assets/index.android.bundle')
        for token in [b'FontAwesome7Light', b'ZadAdhan', b'reader-immersive-tafsir', b'adhan-time-']:
            assert token in bundle, f'Missing runtime marker: {token}'
        font = root / 'assets/private/FontAwesome7-Light-300.otf'
        font_sha = digest(font.read_bytes())
        entry = next((name for name in names if name.endswith('.otf') and digest(apk.read(name)) == font_sha), None)
        assert entry, 'Private Light font was not packaged byte-for-byte'
        catalogue = json.loads((root / 'src/data/adhan-audio.json').read_text(encoding='utf-8'))
        assert json.loads(apk.read('assets/zad-adhan/catalogue.json')) == catalogue, 'Packaged audio catalogue differs'
        for clip_id, clip in catalogue['clips'].items():
            recording = apk.read('assets/zad-adhan/' + clip_id + '.mp3')
            assert len(recording) == clip['bytes'] and digest(recording) == clip['sha256'], f'Packaged recording differs: {clip_id}'
        dex = b''.join(apk.read(name) for name in names if name.endswith('.dex'))
        for token in [b'ZadAdhan', b'AdhanPlaybackService', b'AdhanAlarmReceiver', b'AdhanRefreshJob']:
            assert token in dex, f'Missing native release marker: {token}'
        # R8 renames/merges the Kotlin helpers. Verify their residual owners instead
        # of requiring original class-name strings that release optimization removes.
        mapping_file = build / 'android/app/build/outputs/mapping/release/mapping.txt'
        residual_owners = {name: set() for name in ['AdhanAudio', 'AdhanSequence']}
        owner = None
        for line in mapping_file.read_text(encoding='utf-8').splitlines():
            match = re.match(r'^([^\s].*) -> ([^:]+):$', line)
            if match:
                owner = match[2]
                for helper in residual_owners:
                    if match[1] == 'expo.modules.zadadhan.' + helper:
                        residual_owners[helper].add(owner)
            elif owner:
                for helper in residual_owners:
                    if 'expo.modules.zadadhan.' + helper + '.' in line:
                        residual_owners[helper].add(owner)
        for helper, owners in residual_owners.items():
            assert owners, f'Missing R8 helper mapping: {helper}'
            for residual in owners:
                assert ('L' + residual.replace('.', '/') + ';').encode() in dex, f'Missing residual helper owner: {helper}'
        assert b'AdhanHardwareTest' not in dex and b'AdhanColdStartTest' not in dex, 'Test harness leaked into product APK'
    print(json.dumps({'sourceAndAssetFilesCompared': len(inputs), 'sourceMatchesBuild': True,
                      'compiledSourcesMatched': checked, 'abi': 'arm64-v8a',
                      'fontEntry': entry, 'fontSha256': font_sha, 'fontMatches': True,
                      'nativeAdhanPresent': True, 'testHarnessExcluded': True,
                      'packagedRecordingsMatched': len(catalogue['clips']),
                      'r8AudioHelpersVerified': True,
                      'apkBytes': args.apk.stat().st_size, 'apkSha256': digest(args.apk.read_bytes())}, indent=2))


if __name__ == '__main__':
    main()
