# Private Android preview release record

Package `com.ramadanjourney.preview`, version `0.1.0` / code `1`.

| Gate | Status |
|---|---|
| Typecheck / lint / domain and database tests | PASS |
| Expo configuration checks | PASS, 20/20 |
| Local arm64 release build | In progress; do not infer an artifact |
| APK manifest/signature/hash inspection | Pending built artifact |
| Actual installation and launch | Pending connected Android device |
| Device persistence/audio/navigation smoke | Pending |
| Public KSU usage and dependency review | Open; private preview only |
| Google Play publication | Not performed |

The user offered to connect a USB debugging device during this turn. Device evidence must be recorded only after ADB detects the authorized device and testing is performed. No emulator was configured and the local hypervisor driver was unavailable; those facts are not Android runtime tests.
