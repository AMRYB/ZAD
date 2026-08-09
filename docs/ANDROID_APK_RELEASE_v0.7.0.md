# Private Android preview release record — 0.7.0

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.7.0` / code `10`.

The existing ESA ten-minute reminder now has a native countdown and **Mute this Adhan / Unmute this Adhan**. The selected mute skips only that prayer's intro and Adhan. Playback notifications offer **Stop audio** and **Mute / Unmute**; live mute continues across clips and resets for a new session. Phone alarm volume is unchanged. See `ADHAN_NOTIFICATIONS_V0_7.md` for contracts and actual hardware evidence.

| Gate | Actual status |
|---|---|
| Typecheck / lint / TypeScript suite | PASS, 44 tests |
| Native release-variant JUnit | PASS, 15 tests: six ESA + five sequence/date + four reminder policy |
| Production web export | PASS, all three API routes |
| Isolated Android 16 reminder controls | PASS, real ten-minute schedule spacing, Arabic countdown/title/action, accelerated AlarmManager reminder, mute/undo/mute, persisted flag, silent prayer arrival and expired-action rejection |
| Isolated Android 16 playback controls | PASS, following prayer plays, mute across intro → Adhan, unmute, stop, new unmuted session and stale-control rejection; system alarm-volume value unchanged |
| Isolated screen state | `screenOff=true` sampled at end; not an external acoustic measurement or continuous screen-state record |
| Local arm64 release build | PASS, 8m 31s |
| APK v2 signature / manifest | PASS, same preview certificate, version 0.7.0/code 10, unchanged permissions; new action receiver is not exported |
| Build inputs / compiled sources | PASS, 109 source/config/asset files and seven compiled JavaScript sources |
| Private font / packaged audio / native helpers | PASS, exact Light font, all twelve MP3 hashes, catalogue and R8 residual mappings; action receiver/action strings present; harness excluded |
| Actual Android update and startup | PASS, installed over 0.6.1 on Android 16; cold launch, status ok, process alive, no own-process AndroidRuntime/ReactNativeJS errors observed |
| Actual permissions | Notification and Alarms & reminders access retained |
| New final-product user acceptance | Not repeated; isolated hardware and product install/startup are distinguished |
| Expo Doctor | Not rerun; unchanged dependency baseline remains 19/20 with five SDK 58 patch advisories |
| Deep Doze / reboot / DND / long-term OEM behavior / TalkBack | Not device-tested |
| Public release / Play Store | Not performed |

Artifact relative to repository: `../ZAD_v0.7.0_arm64.apk`, **44524524 bytes**, Android 7.0+ / ARM64 only.

SHA256: `17483fac1385841a752e61cfdbba17e4468a5559dfa12c2f6ccedebeb034def2`.

Compiled runtime revision: `423731be3bb1a0ec0599573b4994e0f0de7147a3`. Later documentation commits do not change the runtime. The isolated harness was disabled and uninstalled. ZAD's user data and permissions were retained. The prepared recordings are unchanged from 0.6.1, including its exact 5.6-second Isha trim. Private audio and licensed Pro fonts remain outside public Git. ESA remains the only timetable authority; KSU remains the only Quran source.

Previous release evidence: `ANDROID_APK_RELEASE_v0.6.1.md` and `BUILD_METADATA_v0.6.1.json`. The user-confirmed 0.6.0 Friday locked-screen result is archived separately and is not counted as new notification-control acceptance.
