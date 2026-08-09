# Private Android preview release record — 0.8.0

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.8.0` / code `11`.

Tasbih sits beside Quran in the bottom tabs. More opens the six-section Adhkar reader and personal Good Deeds page. Local progress, favorites, reading position, custom goals and optional reminder times migrate into the existing private state/backup. See `DEVOTIONAL_V0_8.md` for source provenance and feature boundaries.

| Gate | Actual status |
|---|---|
| Typecheck / lint / TypeScript suite | PASS, 54 tests |
| Native release JUnit | PASS, 20 tests |
| Expo Doctor | 19/20, same five SDK 58 patch advisories; no exclusions |
| Dependency audit | Five high findings in existing Expo/CLI signing chain; documented, no forced SDK migration |
| Production web export | PASS, all routes and three existing API endpoints |
| Browser UI/behavior | PASS, Arabic/light and English/dark, 390px/320px; tap/pull/undo/reload, source/count/favorite/last position, select/custom/check-in/undo/reload/archive, explicit checkbox states |
| Quran reading deep link | PASS, surah 32/ayah 1 on original KSU page 415; previous 1:1 reading position restored after test |
| Isolated Android personal reminders | PASS, six slots, restore planning, actual test delivery/open actions for Adhkar and Good Deeds, duplicate guard, English labels, disable/stale rejection; prayer configuration unchanged |
| Isolated screen state | Non-interactive at final sample; continuous deep-Doze behavior not inferred |
| Local arm64 release build | PASS, full 6m 30s + UI refresh 57s + final reminder-only refresh 25s |
| APK signature / manifest | PASS, v2, same preview signer, 0.8.0/code 11; personal action receiver not exported |
| New permission | Normal `VIBRATE`, explicitly needed for requested haptics; no new microphone/location/storage/overlay permission |
| Inputs / compiled sources / font / recordings | PASS, 124 inputs, 18 compiled sources, exact licensed Light font, all twelve audio hashes and catalogue |
| Personal receiver / haptics / R8 helpers | PASS, native markers and R8 residual mappings; test harness excluded |
| Actual product installation/startup | PASS, update over 0.7.0 and final update over the earlier 0.8.0 preview on Android 16; status ok, process alive, no own-process runtime errors observed |
| New page route intents | Tasbih, Adhkar and Good Deeds accepted by the installed product |
| User physical Tasbih acceptance | PASS, user confirmed counting, felt vibration, and switching vibration off; Tasbih implementation unchanged by final reminder-draft refresh |
| Existing permissions/data | Notifications and exact-alarm access retained; user state not cleared; vibration permission granted |
| Deep Doze / actual reboot / long-term clock delivery / full TalkBack | Not device-tested |
| Public/Play release | Not performed |

Artifact relative to repository: `../ZAD_v0.8.0_arm64.apk`, **44658260 bytes**, Android 7.0+ / ARM64 only.

SHA256: `65c55ea70644db7a3686f4733f8c25eaf2089c378355e53b8426902d20e612b1`.

Compiled runtime revision: `10624884e936005476eaf88feb0972fb234a7e61`. Later documentation commits do not change runtime inputs. Startup reported `UNKNOWN (0)` and is not described as a cold launch. The isolated harness was uninstalled. The twelve prepared recordings retain the 0.6.1 Isha trim and remain outside public Git, together with the licensed Pro font.

Adhkar includes 90 traditional source-pinned entries, with Arabic recitation text and bilingual controls/citations. It does not claim to include every chapter of the source book. Existing KSU Quran content and ESA prayer-time authority are unchanged. Personal reminders are opt-in and inexact; actual ESA prayer alarms retain their existing exact scheduling and notification controls.

Previous release evidence: `ANDROID_APK_RELEASE_v0.7.0.md` and `BUILD_METADATA_v0.7.0.json`.
