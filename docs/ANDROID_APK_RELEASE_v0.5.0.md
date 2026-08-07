# Private Android preview release record — 0.5.0

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.5.0` / code `7`.

| Gate | Actual status |
|---|---|
| Typecheck / lint / TypeScript unit and integration suite | PASS, 40 tests |
| Native release-variant parser tests | PASS, 6 tests |
| Expo Doctor | 19/20; five SDK 58 patch-version recommendations remain, detailed in ADHAN_VERIFICATION.md |
| Production web export | PASS, including KSU, ESA and Adhan-audio API routes |
| Browser reader controls and Adhan flows | PASS; Arabic/English, light/dark, city/date changes and Cairo DST boundary |
| Local arm64 release build | PASS, 7m 22s |
| APK v2 signature / manifest / permissions | PASS; same preview certificate, Adhan permissions inspected |
| Runtime source/config/assets compared to build workspace | PASS, all 91 files match |
| Compiled source-map contents compared to final reader/Adhan sources | PASS, six files match |
| Packaged Light font | PASS; byte-identical to the local licensed source |
| Actual Android installation | PASS, update over 0.4.1 on Android 16; cold launch successful |
| Product city/permissions/scheduling flow | PASS; user selected city, saw times, granted notifications and Alarms & reminders access, and confirmed scheduled-alert message |
| Product reminder and audible Adhan with screen locked | PASS; user pressed the final APK's test button, locked the screen and confirmed both notification and Adhan |
| Separate native hardware checks | PASS; exact alarms, source/cache/audio, notification stop, cancellation and cold-process restart; see ADHAN_VERIFICATION.md |
| Physical reader multitouch / TalkBack / deep Doze / reboot / long-term OEM behavior | Not performed |
| Public release / Play Store | Not performed |

Artifact relative to repository root: `../ZAD_v0.5.0_arm64.apk`, **32939242 bytes**. Android 7.0+ on 64-bit ARM.

SHA256: `e28ed63eb6dc82f891acb3d95eccee2dd8a0c626575bc454cd717ebf3576b893`.

Compiled runtime revision: `ec4118b29dde146561ea1b897a4326e637054a21`, with the locally supplied Font Awesome Pro 7.3.1 Classic Light 300 configuration described in `assets/fonts/README.md`. Paid fonts remain outside public Git. The package, storage identifiers and signing certificate are retained for compatible preview updates. Later documentation/verifier commits do not change this compiled revision.

The APK bundles JS/fonts/assets and does not require Metro. Quran and new timetable downloads require internet. Adhan audio is downloaded to private app storage, hash-verified and then played locally; it is not bundled or committed. Prayer times come exclusively from ESA's linked monthly form, with explicit source failures and no alternate calculation fallback.

The manifest adds notification, exact-alarm, foreground media playback and boot-restoration access. Android backup remains disabled; microphone, storage, overlay and vibration permissions are absent. The user grants notification and exact-alarm access through Android's normal UI. Alarm volume remains under the user's control. No test harness classes are packaged in the product.

The final product test uses +30s/+60s to exercise reminder and playback while locked. The production ten-minute lead is separately verified by timestamp tests. USB was connected; deep Doze, reboot restoration, DND and long-term refresh behavior were not device-tested. Reader pointer checks do not establish physical Android pinch/pan or accessibility behavior.

Reproduce source/font/package comparisons with `python scripts/verify-android-release.py --build-root <build-workspace> --apk <release-apk>`. See `ANDROID_BUILD.md` for build preparation and `ADHAN_VERIFICATION.md` for exact hardware evidence.

Previous inspected build: `ANDROID_APK_RELEASE_v0.4.1.md` and `BUILD_METADATA_v0.4.1.json`.
