# ANDROID APK & GOOGLE PLAY RELEASE RUNBOOK

## 1. Prerequisites
- Actual Expo app, not only an overlay ZIP; clean `npm install` and TypeScript checks.
- A recent Node LTS compatible with selected Expo SDK, Expo account, EAS CLI, supported Android phone/emulator.
- `npx expo-doctor` must report no unresolved blockers; ensure package versions match Expo SDK.
- Select a **unique** Android package ID such as `com.yourbrand.ramadanjourney`, not the `com.example` sample.
- Add `config/eas.json` from this plan to project root as `eas.json` only after checking it against the project SDK.
- Review KSU permissions/usage terms for public release, source attribution, personal data/privacy policy and any third-party licenses.

## 2. Minimum config
Example `eas.json`:

```json
{
  "cli": { "version": ">= 13.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "android": { "buildType": "app-bundle" } }
  }
}
```

In `app.json`/`app.config.ts`: set `expo.name`, `expo.slug`, `expo.version`, `expo.android.package`, adaptive icon and stable splash/icon paths. The sample file in `/config` is **illustrative**, with a placeholder package ID; rename before distributing.

## 3. Commands

```bash
# From the actual initialized Expo project root
npm install
npx expo-doctor
npx expo start

# When local tests and device debugging pass:
npm install -g eas-cli
eas login
eas build:configure

# Installable Android APK for testers:
eas build --platform android --profile preview

# AAB for later Google Play submission (not a directly installable APK):
eas build --platform android --profile production
```

For installation: open the exact URL from EAS build dashboard on your Android device or download APK and `adb install path/to/app.apk`. If the build needs development client/Metro it is **not** a standalone tester APK; test the preview release build without Metro.

## 4. Verify and archive
Record **real** details: EAS build ID, actual package ID, app version/versionCode, profile, Git SHA, artifact URL/path, SHA256 (when downloaded), build timestamp, tested Android model/OS, install result, launch result, top flows passed/failed.

### Mandatory physical device smoke test
- Fresh offline launch opens Arabic home with no Metro connection required.
- Settings switches to English with LTR and preserves choice after relaunch.
- Both themes render properly, including Quran page unfiltered.
- Quran KSU page 1/3/604 works online; click highlights; play KSU Husary; open tafsir.
- Daily prayer/fasting/goals records survive force-stop and app restart.
- Sign-in/social feature is either fully working and secure or not present in that beta.
- Navigation back action does not exit unexpectedly; audio stops/continues only as intended.
- No production secrets in APK or logs, and no crashes in test flow.

## 5. Production AAB
Production is separate. Verify privacy disclosure, permissions, signed builds, Play Store listing, age rating, support contact, data safety, deletion procedure, legal permission for content, crash monitoring and staged rollout. Avoid making Google Play publication an implicit consequence of generating the first APK.

## Official references
- Expo APK guide: https://docs.expo.dev/build-reference/apk/
- Expo production Android build: https://docs.expo.dev/tutorial/eas/android-production-build/
- Expo localization/RTL: https://docs.expo.dev/guides/localization/
