"""Verify release inputs, compiled JS sources and the private icon font without exposing secrets."""
import argparse
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
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
    for directory in ['src', 'assets', 'modules', 'plugins']:
        inputs.extend(p for p in (root / directory).rglob('*') if p.is_file()
                      and not {'build', '.gradle', '.cxx', 'node_modules', '__pycache__'}.intersection(p.relative_to(root).parts))
    inputs.extend(root / name for name in ['package.json', 'package-lock.json', 'app.json', 'scripts/cmake-short-paths.init.gradle'])
    for path in inputs:
        relative = path.relative_to(root)
        assert path.read_bytes() == (build / relative).read_bytes(), f'Build input mismatch: {relative}'
    audio_patch = subprocess.run(['node', str(root / 'plugins/with-branded-audio.cjs'), str(build), '--verify'],
                                 capture_output=True, text=True, check=True)
    audio_patch_hashes = json.loads(audio_patch.stdout)
    ns = '{http://schemas.android.com/apk/res/android}'
    manifest = ET.parse(build / 'android/app/src/main/AndroidManifest.xml').getroot()
    application = manifest.find('application')
    aliases = application.findall('activity-alias')
    package = json.loads((root / 'app.json').read_text(encoding='utf-8'))['expo']['android']['package']
    assert {a.get(ns + 'name') for a in aliases} == {package + '.MorningIcon', package + '.EveningIcon'}, 'Missing launcher aliases'
    assert all(a.get(ns + 'targetActivity') == package + '.MainActivity' for a in aliases), 'Unstable alias target'
    assert sum(a.get(ns + 'enabled') == 'true' for a in aliases) == 1, 'Multiple default launcher icons'
    main = next(a for a in application.findall('activity') if a.get(ns + 'name') in ['.MainActivity', package + '.MainActivity'])
    assert not any(c.get(ns + 'name') == 'android.intent.category.LAUNCHER' for c in main.findall('intent-filter/category')), 'Duplicate MainActivity launcher'
    mapping_path = build / 'android/app/build/intermediates/sourcemaps/react/release/index.android.bundle.packager.map'
    mapping = json.loads(mapping_path.read_text(encoding='utf-8'))
    compiled = {}
    for part in source_maps(mapping):
        for name, text in zip(part['sources'], part.get('sourcesContent', [])):
            if text is not None:
                compiled[name.replace('\\', '/')] = text.replace('\r\n', '\n').strip()
    checked = []
    for relative in ['src/screens/Quran.tsx', 'src/screens/Adhan.tsx', 'src/screens/Settings.tsx',
                     'src/state/AdhanCoordinator.tsx', 'src/core/adhan.ts', 'src/core/adhan-sequence.ts', 'src/services/adhan-native.ts',
                     'src/screens/Tasbih.tsx', 'src/screens/Adhkar.tsx', 'src/screens/GoodDeeds.tsx',
                     'src/screens/devotion/ReminderPreferences.tsx', 'src/state/PersonalReminderCoordinator.tsx',
                     'src/core/devotion.ts', 'src/core/adhkar.ts', 'src/core/personal-reminders.ts', 'src/core/model.ts',
                     'src/app/_layout.tsx', 'src/app/(tabs)/_layout.tsx',
                     'src/core/gamification.ts', 'src/screens/Achievements.tsx', 'src/ui/ParticipationCard.tsx',
                     'src/ui/useLocalDate.ts', 'src/screens/Home.tsx',
                     'src/screens/More.tsx', 'src/screens/Setup.tsx', 'src/screens/Reports.tsx',
                     'src/screens/Listening.tsx', 'src/screens/Widget.tsx', 'src/screens/Account.tsx',
                     'src/state/RecitationProvider.tsx', 'src/state/AuthProvider.tsx', 'src/state/SyncProvider.tsx',
                     'src/state/AppProvider.tsx', 'src/state/WidgetCoordinator.tsx',
                     'src/ui/RecitationBar.tsx', 'src/ui/NextPrayerCard.tsx',
                     'src/core/cloud.ts', 'src/core/cloud-transport.ts', 'src/core/auth-callback.ts',
                     'src/core/recitation.ts', 'src/core/reports.ts', 'src/core/personalization.ts',
                     'src/services/pkce-crypto.native.ts', 'src/services/auth-storage.ts',
                     'src/state/BrandingCoordinator.tsx', 'src/ui/StartupIntro.tsx', 'src/ui/TasbihBeads.tsx', 'src/ui/components.tsx']:
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
        intro = root / 'assets/branding/intro.mp4'
        intro_entry = next((n for n in names if n.endswith('.mp4') and digest(apk.read(n)) == digest(intro.read_bytes())), None)
        assert intro_entry, 'Prepared intro clip was not packaged byte-for-byte'
        assert json.loads(apk.read('assets/zad-adhan/catalogue.json')) == catalogue, 'Packaged audio catalogue differs'
        for clip_id, clip in catalogue['clips'].items():
            recording = apk.read('assets/zad-adhan/' + clip_id + '.mp3')
            assert len(recording) == clip['bytes'] and digest(recording) == clip['sha256'], f'Packaged recording differs: {clip_id}'
        dex = b''.join(apk.read(name) for name in names if name.endswith('.dex'))
        for token in [b'ZadAdhan', b'AdhanPlaybackService', b'AdhanAlarmReceiver', b'AdhanRefreshJob',
                      b'AdhanReminderActionReceiver', b'zad.adhan.MUTE_PRAYER', b'zad.adhan.UNMUTE_PRAYER',
                      b'DailyReminderReceiver', b'zad-personal-reminders-v1', b'ExpoHaptics',
                      b'AudioControlsService', b'ZadWidget', b'RecitationSleepReceiver',
                      b'ExpoSecureStore', b'ExpoCrypto', b'zad_notification', b'ExpoVideo',
                      b'BrandingReceiver', b'BrandRefreshJob', b'MorningIcon', b'EveningIcon']:
            assert token in dex, f'Missing native release marker: {token}'
        # R8 renames/merges the Kotlin helpers. Verify their residual owners instead
        # of requiring original class-name strings that release optimization removes.
        mapping_file = build / 'android/app/build/outputs/mapping/release/mapping.txt'
        residual_owners = {name: set() for name in ['AdhanAudio', 'AdhanSequence', 'IntroSystemBars']}
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
        assert all(n not in dex for n in [b'AdhanHardwareTest', b'AdhanColdStartTest', b'BrandingHostActivity']), 'Test harness leaked into product APK'
    print(json.dumps({'sourceAndAssetFilesCompared': len(inputs), 'sourceMatchesBuild': True,
                      'compiledSourcesMatched': checked, 'abi': 'arm64-v8a',
                      'fontEntry': entry, 'fontSha256': font_sha, 'fontMatches': True,
                      'nativeAdhanPresent': True, 'testHarnessExcluded': True,
                      'nativeReminderActionsPresent': True,
                      'personalReminderReceiverPresent': True, 'hapticsModulePresent': True,
                      'packagedRecordingsMatched': len(catalogue['clips']),
                      'r8AudioHelpersVerified': True,
                      'pinnedNativeMediaPatch': audio_patch_hashes,
                      'launcherAliasesVerified': True, 'introEntry': intro_entry, 'introMatches': True,
                      'introSha256': digest(intro.read_bytes()), 'introSystemBarsVerified': True,
                      'apkBytes': args.apk.stat().st_size, 'apkSha256': digest(args.apk.read_bytes())}, indent=2))


if __name__ == '__main__':
    main()
