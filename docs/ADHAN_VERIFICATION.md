# Adhan implementation verification

This document preserves the 0.5.0 baseline and its actual device results. For current 0.6 prayer-specific audio, final APK evidence and remaining acceptance checks, see `ADHAN_AUDIO_V0_6.md`, `ANDROID_APK_RELEASE.md` and `BUILD_METADATA.json`. Do not count a baseline locked-screen result as a new 0.6 test.

## Executed on 2026-10-24

- TypeScript `npm test`: 40 PASS, including seven ESA/Adhan tests and all previous reader/storage/backend tests.
- `npm run typecheck` and `npm run lint`: PASS.
- Native release-variant JUnit: 6 PASS, covering actual source rows, full-month/date/city validation, Arabic AM/PM parsing and Cairo DST conversion.
- Expo autolinking: `expo.modules.zadadhan.ZadAdhanModule` discovered as the local `zad-adhan` Android module.
- Expo Doctor: **19/20**. The remaining check recommends newly available patch versions (`expo` 58.0.19, `expo-file-system` 58.0.11, `expo-font` 58.0.10, `expo-router` 58.0.26, `expo-sqlite` 58.0.14). This preview retains its existing locked SDK 58 patch versions; this advisory is not counted as a pass.
- Production web export: PASS, including all three API routes.
- Browser at 390×844: More → Adhan, initial city sheet, city search, Cairo, Alexandria, today/tomorrow, 2026-10-30 clock-change times, English/LTR and dark theme checked. Source errors remain explicit. Fullscreen play center equals card center (195.2px); ayah is physically right and text-only tafsir left. Reader page arrows are absent from the navigation card.
- App audio relay: HTTP 200, `audio/mpeg`, 407,680 bytes and expected SHA-256 verified.

## Real Android phone

Device model `23117RA68G`, Android 16. Device serial and unrelated phone data are omitted.

The disposable `com.zad.adhanharness` APK compiles the **production Kotlin sources** directly, excluding only the Expo bridge. It has its own app storage and does not modify ZAD's records or settings. Its shell-only test receiver is protected by `android.permission.DUMP` and is never part of the product APK.

Executed hardware checks:

1. Native HTTPS GET/POST to ESA, actual monthly private cache, SHA-verified MP3 download and exact alarm registration: PASS.
2. Prayer reminder timestamps exactly 600,000 ms before the matching Adhan; sunrise excluded: PASS.
3. Real `AlarmManager` reminder delivered without any activity or JavaScript runtime: PASS.
4. Real exact alarm started a media foreground service and MP3 playback: PASS. First run recorded `screenOffAtPlayback=true`.
5. The foreground notification's stop PendingIntent stopped the service and playback: PASS.
6. Disabling Adhan cleared stored pending alarms and the refresh job and rejected old-generation events: PASS.
7. Additional cold-start run: armed test alarms, ended instrumentation, issued normal `am kill` (not force-stop), confirmed process absent, then observed a new process and foreground `AdhanPlaybackService` with notification ID 71033: PASS.

The user initially heard the reminder but no Adhan and then confirmed the phone's **alarm volume was zero**. The app never changed that volume. After the user raised it, the final cold-start playback was explicitly confirmed audible by the user. A warning and sound-settings shortcut were added for muted/zero alarm volume.

The first lock-screen run establishes screen-off service delivery; the later audible cold-start run establishes process restart and audibility. Do not combine these into a claim that every scenario (deep Doze, reboot, force-stop, DND, all OEM restrictions) was tested. USB was connected during testing. Reboot restoration, DND behavior and long-term refresh/OEM battery behavior remain code-reviewed rather than device-proven.

Test notifications use +30s/+60s to avoid waiting for an actual prayer. The production reminder/Adhan interval is independently checked as ten minutes. The disposable harness was stopped and uninstalled after verification.

## Reproduction

From the repo, with the configured Android SDK and JBR, build the isolated hardware APK using an available Gradle wrapper:

```powershell
& 'C:\work\rj-01a1\android\gradlew.bat' -p tests/android-harness assembleDebug --max-workers=1 --no-parallel
adb install -r -t tests/android-harness/build/outputs/apk/debug/ZadAdhanHardwareTest-debug.apk
adb shell pm grant com.zad.adhanharness android.permission.POST_NOTIFICATIONS
adb shell appops set com.zad.adhanharness SCHEDULE_EXACT_ALARM allow
adb shell am instrument -w com.zad.adhanharness/expo.modules.zadadhan.AdhanHardwareTest
```

These grants apply only to the disposable test package. The product requests access through its own user-facing flow.

For a cold-start check, while the harness already holds verified cached source data/audio:

```powershell
adb shell am broadcast -n com.zad.adhanharness/expo.modules.zadadhan.AdhanColdStartTest
adb shell am kill com.zad.adhanharness
adb shell pidof com.zad.adhanharness
# The process should be absent before the alarm. Wait for the scheduled audio, then inspect:
adb shell dumpsys activity services com.zad.adhanharness
adb shell am broadcast -n com.zad.adhanharness/expo.modules.zadadhan.AdhanColdStartTest --ez cleanup true
adb uninstall com.zad.adhanharness
```

Only inspect this test package. Do not dump unrelated notifications, accounts, device identifiers or private user data.

## Product APK

The final **ZAD 0.5.0 / code 7** arm64 APK was installed successfully over 0.4.1 on the same Android 16 phone and cold-launched into Adhan. The user confirmed the timetable appeared, selected a city and enabled Adhan. Notification permission was granted. After opening the app's Alarms & reminders setup, granting access and returning, the user confirmed the scheduled-alert message. Read-only package checks independently confirmed exact-alarm access and registered alarms/refresh work.

The user then pressed the final product APK's test button and locked the screen for a minute. The user explicitly confirmed **both the notification and audible Adhan worked from ZAD**. This is final-product end-to-end evidence, separate from the isolated harness checks above. The test uses +30s/+60s; the real ten-minute prayer reminder lead is independently covered by timestamp checks. USB was connected, so this does not establish deep-Doze or long-term battery behavior.

Signature/manifest checks, all 91 runtime source/config/asset comparisons, six compiled JavaScript source comparisons, exact packaged-font verification and artifact hash/size are recorded in `ANDROID_APK_RELEASE.md` and `BUILD_METADATA.json`. The test harness was excluded from the product and uninstalled. The user's actual Adhan settings and scheduled prayers were retained.
