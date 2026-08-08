# Android build instructions

## Configuration

Expo SDK 58.0.17, React Native 0.88.0, Node 24, Java from Android Studio, and Android SDK/NDK versions resolved by the generated Expo/Gradle project. Package: `com.ramadanjourney.preview`; version `0.1.0`, versionCode `1`. Generated native directories are not hand maintained or included in the source archive.

`eas.json` separates an internal APK profile from the production AAB profile. A hosted EAS build needs the owner's Expo account/project; no account or cloud build was created here.

## Windows local build

Use a short **physical** checkout path, for example `C:\work\rj`. The original deeply nested workspace exceeded native Ninja object path limits. A SUBST drive did not solve autolinking consistently in this environment.

```powershell
# In a short physical checkout of this source:
npm.cmd ci
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NODE_ENV = 'production'
npx.cmd expo prebuild --platform android --no-install
Set-Location android
.\gradlew.bat :app:assembleRelease --console=plain --max-workers=1 --no-parallel --init-script '..\scripts\cmake-short-paths.init.gradle' '-PreactNativeArchitectures=arm64-v8a' '-Pkotlin.compiler.execution.strategy=in-process'
```

The optional Gradle init script adds `CMAKE_OBJECT_PATH_MAX=250`; it does not edit native dependency sources. The actual build workspace used was `C:\work\rj-01a1`. The arm64 build targets **64-bit ARM Android devices only**. A universal or x86 emulator artifact is a separate build, not an inferred result.

Expected output after Gradle reports success: `android\app\build\outputs\apk\release\app-release.apk`. The generated local release configuration uses a development/debug signing certificate for this private preview. It must not be treated as a production signing identity. Use owner-controlled EAS/Play signing for a later production release.

## Verification

Run `apksigner verify --verbose` and `aapt dump badging` from Android SDK build-tools against the built file, calculate SHA256, then install on an explicitly authorized test device. Record the actual model, Android version, installation, startup and interaction results. The package includes its JS/assets and must launch without Metro; KSU content still needs network connectivity.

See `ANDROID_APK_RELEASE.md` for the actual gate status and artifact fingerprint, and `source-plan/docs/ANDROID_APK_RELEASE.md` for the original broader release checklist.
