# Adhan implementation verification

## Executed on 2026-10-24

- TypeScript `npm test`: 40 PASS, including seven ESA/Adhan tests and all previous reader/storage/backend tests.
- `npm run typecheck` and `npm run lint`: PASS.
- Native release-variant JUnit: 6 PASS, covering actual source rows, full-month/date/city validation, Arabic AM/PM parsing and Cairo DST conversion.
- Expo autolinking: `expo.modules.zadadhan.ZadAdhanModule` discovered as the local `zad-adhan` Android module.
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

Final APK build, signature/manifest/source checks and installation results are recorded in `ANDROID_APK_RELEASE.md` and `BUILD_METADATA.json`. Hardware module verification alone is not a claim that the final ZAD APK was already installed.
