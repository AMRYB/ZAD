# Private Android preview release record — 0.2.0

Package `com.ramadanjourney.preview`, version `0.2.0` / code `2`.

| Gate | Status |
|---|---|
| Typecheck / lint / 23 tests | PASS |
| Expo configuration checks | PASS, 20/20 |
| Browser reader interactions and screenshots | PASS for the exact checks in QA_REPORT; not Android evidence |
| Local arm64 release build | PASS — initial build 7m 30s; final copy revision build 1m 2s |
| APK signature / manifest / permissions | PASS — APK v2 signature, arm64, backup disabled, minimal permissions |
| Runtime source vs. build workspace | PASS — all 42 compared source/config files match |
| Update signing identity | Same certificate as 0.1; package unchanged, version code increased |
| Actual Android installation / launch | Not performed; user requested APK handoff |
| Native persistence / interruptions / TalkBack | Pending installed-device testing |
| Public release / Play Store | Not performed |

Artifact: `../Ramadan_Journey_v0.2.0_arm64.apk`, **32605894 bytes**. Requires Android 7.0+ on 64-bit ARM.

SHA256: `6552821ce6b03669f129139cc3f8ef39a7a73dcccb74e0b899930dd7df41c8ba`.

Compiled code revision: `2478a494b2fc601b5245e206b9b3e7190c9e2ac1`. See `BUILD_METADATA.json`. The artifact uses an Android debug certificate for a private preview; production signing is a separate release step. The APK bundles its JS/assets and does not require Metro. Loading Quran content requires internet access.

The original 0.1 record is preserved below for comparison. It must not be read as the status or fingerprint of 0.2.

---

# Version 0.1 baseline release record

Package `com.ramadanjourney.preview`, version `0.1.0` / code `1`.

| Gate | Status |
|---|---|
| Typecheck / lint / domain and database tests | PASS |
| Expo configuration checks | PASS, 20/20 |
| Local arm64 release build | PASS — final Gradle build succeeded in 5m 30s |
| APK manifest/signature/hash inspection | PASS — v2 signature, manifest, permissions and SHA256 checked |
| Actual installation and launch | Not performed — USB/ADB did not detect the offered phone; user requested file handoff |
| Device persistence/audio/navigation smoke | Pending user installation |
| Public KSU usage and dependency review | Open; private preview only |
| Google Play publication | Not performed |

The user offered to connect a USB debugging device during this turn. Device evidence must be recorded only after ADB detects the authorized device and testing is performed. No emulator was configured and the local hypervisor driver was unavailable; those facts are not Android runtime tests.

## Built artifact

`../Ramadan_Journey_v0.1.0_arm64.apk` in the parent outputs folder, 32585170 bytes. Android 7.0+ on 64-bit ARM only.

SHA256: `71a312a0513b4895306c9452608a8adfff917e4978f4cec02303d4bfc014509a`.

Final compiled source matches all 37 compared application/configuration files. Code revision: `af7252fb32a414e9321689dbd6cb644343564546`. See `BUILD_METADATA_v0.1.json`.

Final APK manifest inspection confirmed `allowBackup=false` and absence of microphone, external-storage, overlay-window and vibration permissions. The remaining platform permissions are internet, audio settings, network state, wake lock and the app-specific signature receiver permission.
