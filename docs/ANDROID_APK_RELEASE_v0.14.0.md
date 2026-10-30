# Private Android beta artifact —0.14.0

ZAD / زاد, package `com.ramadanjourney.preview`, **0.14.0 / code21**. Final compiled runtime revision: `89fbb99`. Documentation-only commits do not change this APK.

Adds an explicitly activated local Qibla guide with true north and calibration/accuracy guidance, moves city/date/notification/audio controls to Settings → Adhan, and adds an official-time day arc/current Cairo clock/next prayer with native animated sky illustrations and gray elapsed-time rows. Elapsed rows do not mark prayers performed or grant XP.

The first Android candidate showed no arrow. After startup repair, the same phone displayed a real arrow, position uncertainty and sensor-reported high calibration; Stop cleared readings and restarting reacquired them. Directly leaving Qibla returned to Explore. This establishes functional acquisition/control, **not surveyed physical direction accuracy or a100% guarantee**. A fresh first-permission prompt after the fix and controlled known-angle/tilt/interference checks were not repeated.

| Gate | Actual result |
|---|---|
| Typecheck / clean full lint | PASS |
| TypeScript source suite | PASS;105 tests:6 Qibla/session and4 prayer-display tests in addition to prior coverage |
| Native parser/policy suite | PASS;30 tests; JVM tests do not measure compass accuracy |
| Production web export | PASS after final repair |
| Browser UI | PASS; Arabic Light390px and English Dark320px, settings/date/city search, explicit web compass limit, clock/next prayer and past/future rows; original Arabic/Light restored |
| Browser/server limit | A development Metro module-cache error occurred during rebuild activity; server was stopped and final export/new preview used; no clean whole-session log claim |
| Android build | Initial8m30s; final startup-repair incremental1m6s,606 tasks:25 executed/581 up-to-date |
| Build inputs / compiled JavaScript | PASS;223 compared inputs /66 compiled sources |
| Native Qibla wiring | PASS; Expo Location packaged, foreground coarse/fine permissions, no background or location foreground-service permission |
| Retained assets/native helpers | PASS;13 exact recordings, font, silent9s intro, bead sound, branded source-built audio patch/launcher aliases and harness exclusion |
| Signature/configuration | PASS; existing v2 private preview signer; Android/embedded Expo0.14.0/code21;ARM64,min24/target36/compile37 |
| Update and launch | PASS on Android16 over0.13.0, followed by repaired-candidate reinstall; no clear/uninstall or ADB permission grant |
| Final real-device UI | PASS by direct temporary USB mirror interaction: real compass reading, Stop/reacquire/leave; prayer arc, next prayer/countdown, gray elapsed Fajr, illustrations and settings inspected |
| Owner feedback | Initial page opened but arrow absent; final repaired behavior observed directly by the agent; user record-retention/known-direction acceptance not separately claimed |
| Dependency advisory | Doctor19/20:11 patch mismatches; current audit4 high/5 low/0 critical; no forced unrelated upgrade |

Artifact: **ZAD_v0.14.0_arm64.apk**, **71,445,053 bytes**.

SHA256: `40ac0658094325c02beb419a7d57bb0fddafa6bacd99a43937017d3d9efcfbde`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Development/private-preview signing, not production signing.

Source/limits: [Qibla guide](QIBLA_V0_14.md), [prayer day](PRAYER_DAY_V0_14.md), [metadata](BUILD_METADATA.json) and [release readiness](RELEASE_READINESS.md). Previous0.13 evidence is archived separately.

Qibla coordinates remain in memory and are not recorded in Git, app backups, cloud snapshots or logs. The OS location provider may use normal system services. All Quran and timetable sources remain KSU and ESA respectively. Existing public-distribution/source-rights/SMTP/signing/Doze/accessibility gates remain open. Native airplane-mode offline reads and a full audible Adhan interruption matrix were not rerun in this revision.

Source/docs are delivered through Git; private recordings/fonts, temporary phone-mirroring files and APK binaries are excluded from repository history. No new GitHub Release is published by this work.
