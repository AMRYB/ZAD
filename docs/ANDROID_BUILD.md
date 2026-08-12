# Android build instructions

## Configuration

Expo SDK 58.0.17, React Native 0.88.0, Node 24, Java from Android Studio, and Android SDK/NDK versions resolved by the generated Expo/Gradle project. Package: `com.ramadanjourney.preview`; current source and installed ZAD preview version `0.9.0`, versionCode `12`. The local `modules/zad-adhan` Expo module is autolinked during generation. Generated native directories are not hand maintained or included in the source archive.

`eas.json` separates an internal APK profile from the production AAB profile. A hosted EAS build needs the owner's Expo account/project; no account or cloud build was created here.

## Windows local build

Use a short **physical** checkout path, for example `C:\work\rj`. The original deeply nested workspace exceeded native Ninja object path limits. A SUBST drive did not solve autolinking consistently in this environment.

```powershell
# In a short physical checkout of this source:
npm.cmd ci
# Private preview: prepare the licensed Pro font and exact local Adhan assets first.
python scripts/install-adhan-audio.py
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NODE_ENV = 'production'
$env:CI = '1'
$env:CMAKE_BUILD_PARALLEL_LEVEL = '1'
npx.cmd expo prebuild --platform android --no-install
Set-Location android
.\gradlew.bat :zad-adhan:testReleaseUnitTest :app:assembleRelease --console=plain --max-workers=1 --no-parallel --init-script '..\scripts\cmake-short-paths.init.gradle' '-PreactNativeArchitectures=arm64-v8a' '-Pkotlin.compiler.execution.strategy=in-process'
```

The optional Gradle init script adds `CMAKE_OBJECT_PATH_MAX=250`; it does not edit native dependency sources. The actual build workspace used was `C:\work\rj-01a1`. The arm64 build targets **64-bit ARM Android devices only**. A universal or x86 emulator artifact is a separate build, not an inferred result.

Expected output after Gradle reports success: `android\app\build\outputs\apk\release\app-release.apk`. The generated local release configuration uses a development/debug signing certificate for this private preview. It must not be treated as a production signing identity. Use owner-controlled EAS/Play signing for a later production release.

## Verification

Run `apksigner verify --verbose` and `aapt dump badging` from Android SDK build-tools against the built file, calculate SHA256, then install on an explicitly authorized test device. Record the actual model, Android version, installation, startup and interaction results. The package includes its JS/assets and must launch without Metro; KSU content still needs network connectivity.

`scripts/verify-android-release.py` compares a marked build workspace against the maintained source, checks eighteen compiled source-map contents, native Adhan classes/R8 residual mappings, prayer/personal reminder-action receivers and action strings, the native haptics module, ARM64 libraries, the exact local licensed Light font, all twelve packaged recording hashes and test-harness exclusion. This private-build verifier requires the local Pro font/audio setup and a `.ramadan-build-workspace` text marker containing the maintained repository's absolute path; it intentionally rejects a mismatched workspace. Run it from the maintained repository with `--build-root <short-build-workspace> --apk <release-apk>` after building. A public checkout retains the Free font fallback until its owner supplies licensed Pro assets; matching local recordings are separately required for the complete private audio build. See `ADHAN_AUDIO_V0_6.md`.

See `ANDROID_APK_RELEASE.md` for the actual gate status and artifact fingerprint, and `source-plan/docs/ANDROID_APK_RELEASE.md` for the original broader release checklist.

## Personal participation 0.9.0

Source version is now 0.9.0/code 12. Local build, signature, manifest, 129 input comparisons, 23 compiled sources, exact Pro Light font, twelve audio hashes and native/harness checks PASS. Twenty native unit tests were rerun. The artifact was installed over 0.8.0 after ADB reconnection and cold-launched into achievements on Android 16, with no observed own-process errors and permissions retained. Native XP interaction/user acceptance remains pending. See `ANDROID_APK_RELEASE.md` for the current explicit gate.
