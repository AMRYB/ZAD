# Private Android preview release record — 0.9.0

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.9.0` / code `12`. Runtime source revision `8b608ec1ef78914746e7825a297605e95abee8a4`; later test/documentation commits do not change the compiled app.

Personal offline XP, progressive levels and twelve correction-aware badges are available from Home and More → My achievements. This is a private device-local ledger, separate from trusted server XP. Authentication/cloud sync/leaderboards/challenges remain inactive. Existing records migrate without deletion or historical awards. See `GAMIFICATION_V0_9.md`.

| Gate | Actual status |
|---|---|
| Typecheck / lint / TypeScript suite | PASS, 66 tests including twelve new gamification tests |
| Native release JUnit | PASS, 20 tests rerun |
| Browser flow | PASS, Home/More entry, check-in → XP/badge, reload, undo/relock, redo without duplication, filtering and rules |
| Browser layout | PASS, Arabic/light 320px and English/dark 390px; zero measured horizontal overflow, badge cards visually inspected, no console errors |
| Production web export | PASS for new feature route and existing three API routes; before final text-only polish/version bump |
| Local arm64 release build | PASS, 10m 30s; 543 executed and 28 up-to-date tasks |
| Signature / manifest | PASS, v2; same preview signer, 0.9.0/code 12, minSdk 24 / target 36 / compile 37 |
| Source / compiled inputs | PASS, 129 files, 23 compiled source-map contents |
| Font / audio / native modules | PASS, exact licensed Light font, twelve recording hashes/catalogue, receivers, haptics and R8 audio helpers; harness excluded |
| New permissions | None; manifest permission set equals 0.8.0 |
| Device installation / launch | PENDING; phone disconnected during build, install attempt returned no devices/emulators found |
| Actual native XP interactions | Not verified; browser/domain checks are not a substitute for device interaction |
| Doctor / dependency audit | Not repeated; dependency graph unchanged. Prior Doctor 19/20 and five high audit findings remain documented in DEVOTIONAL_V0_8.md |

Artifact: `../ZAD_v0.9.0_arm64.apk` — 44,679,792 bytes.

SHA256: `a232575d2c4dcb6b8950f74d6118f91eccf1350e412313820c5733d91e70c2bd`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c` (private development/debug signing, not production signing).

The installed and user-accepted 0.8.0 baseline is preserved in `ANDROID_APK_RELEASE_v0.8.0.md` / `BUILD_METADATA_v0.8.0.json`. The attempted update did not uninstall or clear app data. Current build is not represented as device-tested until the installation gate is completed. ARM64 only; no Play/AAB/public release. Long-term Doze/reboot, full TalkBack and new native XP acceptance remain separate verification scope.
