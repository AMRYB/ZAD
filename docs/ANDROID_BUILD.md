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

`scripts/verify-android-release.py` compares a marked build workspace against the maintained source, checks the critical compiled source-map contents, native Adhan classes/R8 residual mappings, prayer/personal reminder-action receivers and action strings, the native haptics module, ARM64 libraries, the exact local licensed Light font, all twelve packaged recording hashes and test-harness exclusion. This private-build verifier requires the local Pro font/audio setup and a `.ramadan-build-workspace` text marker containing the maintained repository's absolute path; it intentionally rejects a mismatched workspace. Run it from the maintained repository with `--build-root <short-build-workspace> --apk <release-apk>` after building. A public checkout retains the Free font fallback until its owner supplies licensed Pro assets; matching local recordings are separately required for the complete private audio build. See `ADHAN_AUDIO_V0_6.md`.

See `ANDROID_APK_RELEASE.md` for the actual gate status and artifact fingerprint, and `source-plan/docs/ANDROID_APK_RELEASE.md` for the original broader release checklist.

## Personal participation 0.9.0

Source version is now 0.9.0/code 12. Local build, signature, manifest, 129 input comparisons, 23 compiled sources, exact Pro Light font, twelve audio hashes and native/harness checks PASS. Twenty native unit tests were rerun. The artifact was installed over 0.8.0 after ADB reconnection and cold-launched into achievements on Android 16, with no observed own-process errors and permissions retained. The user confirmed native XP, a displayed badge and the continued presence of previous data. See `ANDROID_APK_RELEASE.md` for the current explicit gate.


## Connected journey 0.10.0

The new media-session customization requires expo-audio to be built from source; package.json declares expo.autolinking.android.buildFromSource and the registered plugins/with-branded-audio.cjs applies the guarded source patch during prebuild. Do not remove the source-build setting or accept a release-verifier failure by weakening its checks. The verifier also checks plugin inputs/applied hashes, native media branding, SecureStore/Crypto, the sleep receiver and widget in addition to the existing Adhan/font/asset gates. See RELEASE_READINESS.md for production gates and JOURNEY_V0_10.md for actually completed checks.


## Timed branding 0.11.1

Keep the day/night config plugin and native resources together: launcher aliases require stable MainActivity, the original day/night PNGs and scale wrappers. Fractional insets are restricted to drawable-v26; API24/25 use dimensions. Expo Video adds a native module and the unchanged supplied MP4. The release verifier additionally checks aliases, compiled startup/coordinator sources, video hash and exclusion of the branding harness. Rebuild from marked prebuild sources; preserve the existing development signer when updating the private phone. See BRANDING_V0_11.md.


## Silent fullscreen intro 0.11.2

The tracked startup MP4 is a stream-copy of the original first nine seconds, with audio removed. Its270 decoded frame hashes match the supplied source; no video re-encoding was applied. The native IntroSystemBars helper uses existing AndroidX dependencies and restores previous bars after playback. No new Expo/native dependency or permission is added. The verifier checks the prepared video hash and R8 residual owner of the system-bar helper.
