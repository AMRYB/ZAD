# Private Android preview release record

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

Final compiled source matches all 37 compared application/configuration files. Code revision: `af7252fb32a414e9321689dbd6cb644343564546`. See `BUILD_METADATA.json`.

Final APK manifest inspection confirmed `allowBackup=false` and absence of microphone, external-storage, overlay-window and vibration permissions. The remaining platform permissions are internet, audio settings, network state, wake lock and the app-specific signature receiver permission.
