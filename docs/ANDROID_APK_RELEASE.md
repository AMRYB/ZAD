# Private Android preview release record — 0.6.0

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.6.0` / code `8`.

| Gate | Actual status |
|---|---|
| Typecheck / lint / TypeScript suite | PASS, 44 tests |
| Native release-variant JUnit | PASS, 11 tests: six ESA + five sequence/date |
| Expo Doctor | 19/20; same five SDK 58 patch recommendations retained |
| Production web export | PASS, all three API routes |
| Browser prayer previews | PASS: Arabic normal/Friday, English/dark, intro → Rifaat and intro → Al-Azhar, stop; fresh final tab had no error logs |
| Local arm64 release build | PASS, full build 7m 21s; final incremental refresh 2m 54s |
| APK v2 signature / manifest | PASS, same preview certificate and unchanged permission set |
| Build workspace/source comparison | PASS, 107 source/config/asset files and seven compiled JavaScript sources |
| Light font / packaged audio | PASS, exact font and all twelve MP3 hashes; native catalogue matches |
| Optimized native helpers | PASS, R8 residual owners verified; test harness excluded |
| Android update and launch | PASS, over 0.5.0 on Android 16; status ok, process alive, no own-process runtime errors observed |
| Actual permissions | Notification and Alarms & reminders access retained |
| Isolated native playback | PASS, six pairs/all twelve files, notification stop and intro cancellation |
| Isolated alarm regression | PASS, +30s reminder/+60s foreground MP3, cancellation and ten-minute timestamp spacing; screen was on |
| Final product Friday test with screen locked | Pending user confirmation |
| Deep Doze / reboot / DND / long-term OEM behavior / TalkBack | Not device-tested |
| Public release / Play Store | Not performed |

Artifact relative to repository: `../ZAD_v0.6.0_arm64.apk`, **44590996 bytes**, Android 7.0+ / ARM64 only.

SHA256: `1d97d3d5f48a276c04763d6d375033eaf88a06b01d3316014ceb61712fe5b2b7`.

Compiled runtime revision: `e65b6ee405853f13e211a45878c13e2661b551e9`. Later verifier/documentation commits do not change the runtime. The package, storage identifiers and signing certificate preserve preview update compatibility. Launch returned `UNKNOWN (0)`, so it is recorded as successful startup rather than an asserted cold launch. The APK includes JS/fonts/assets and needs no Metro.

The twelve source-pinned recordings/intros are included only in the private APK; public Git contains metadata/hashes and setup instructions. Android verifies/extracts them to private files for offline playback. ESA remains the exclusive timetable authority and KSU the exclusive Quran source. At ESA time the intro starts, then the matching Adhan about 10–11 seconds later. The reminder remains ten minutes before ESA time. Friday Dhuhr replaces its ordinary pair using the saved Cairo event date; no second mosque-call time is invented. See `ADHAN_AUDIO_V0_6.md`.

Notification stop clears current and waiting audio. Volume/DND stay user-controlled. Backup is disabled; no microphone, storage, overlay or vibration permission is present. Font Awesome Pro 7.3.1 Light files and prepared recordings are excluded from public Git.

The user freed disk space during the build. No unrelated files were deleted. The disposable test package was uninstalled; ZAD's settings/schedules were retained. The isolated alarm regression had `screenOff=false`; the archived 0.5 locked-screen result is not used as final 0.6 evidence.

Run `python scripts/verify-android-release.py --build-root <workspace> --apk <release-apk>` to reproduce input/font/audio/package checks. The verifier follows R8 mappings for renamed/merged helpers, rather than requiring removed original class-name strings in DEX.

Previous evidence: `ANDROID_APK_RELEASE_v0.5.0.md` and `BUILD_METADATA_v0.5.0.json`.
