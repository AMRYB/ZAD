# Private Android beta release — 0.10.0

ZAD / زاد, package com.ramadanjourney.preview, version 0.10.0 / code 13. Compiled runtime source: `604b4406c7e68037394309187fcc4ccd8cdf3a65`. Documentation/test-only commits after this revision do not change the APK.

This release preserves the accepted 0.9.0 local journey and adds personalized Home/setup, separate Explore/Settings, 7/30-day reports, queued background KSU recitation/sleep timer, an ESA-cache Android widget and optional private accounts/sync. Per-ayah duration and ayah number/total follow the user's final choice. Isha retains its earlier 5.6-second beginning trim and removes exactly the requested final 57 seconds.

| Gate | Actual result |
|---|---|
| TypeScript / lint / unit suite | PASS, typecheck and clean full ESLint; 81 tests |
| Native policy/parser unit suite | PASS, 22 tests |
| Isolated Android hardware checks | PASS, 5: timer schedule/cancel, stale/replacement isolation, invalid durations, real widget registration/layout and attached notification artwork; separate harness removed afterward |
| Expo Doctor | PASS, 20/20 after compatible SDK patches |
| npm audit | Five high findings remain in the Expo CLI/code-signing/node-forge/zod chain; no clean-audit claim |
| Production web export | PASS, feature routes and three fixed-source API routes |
| Browser journeys | PASS, optional setup/city search/persistence, actual ESA countdown, synthetic habit-to-7/30-day-report, guest email validation, KSU audio continuing across navigation and ayahs, repeat and timer set/cancel |
| Browser layout | Arabic/light 390px and English/dark 320px visually checked, measured zero horizontal overflow; broader TalkBack/system-text testing remains open |
| Native build | PASS; customized Expo Audio compiled from source, final incremental repair 3m 59s, 606 tasks (47 executed / 559 up-to-date) |
| Signature / manifest | PASS, v2 existing preview signer; ARM64, min24 / target36 / compile37; unused biometric, microphone, storage and overlay permissions absent; automatic Android backup disabled |
| Inputs / compiled source | PASS, 178 source/asset/plugin/config files and 44 critical compiled JS source-map contents |
| Packaged assets/native patch | PASS, exact Pro Light font, 12 recording hashes/catalogue, guarded native media patch hashes and compiled branding marker, widget/sleep/SecureStore/Crypto and existing reminder/haptics/R8 checks; harness excluded |
| Android installation/startup | PASS on Android 16 via install -r, no ZAD uninstall/data clear. First 0.10 launch COLD1007ms; final repaired install WARM909ms and corrected reentry HOT229ms. No observed own-process runtime errors; media service independently observed foreground |
| Owner account / private sync | User confirmed email link sign-in, explicit guest import/private sync completion and retained records |
| Widget / Isha cutoff | User confirmed widget appeared and Isha ending is correct |
| Final repaired recitation | User confirmed audio plays and notification is correct after removal of image preparation from the startup path |
| Hosted authorization | PASS: anonymous read/sync401; real role/RLS/CAS/replay/private-board/scoped-deletion smoke test with two rolled-back synthetic identities |

Artifact beside the project: **ZAD_v0.10.0_arm64.apk**, **44,904,584 bytes**.

SHA256: `8d9c06407a40e2f2e1a9efad06c9f29f8691ff3d016826f77a0b2667e5d4715f`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Development/debug signing only; no public Play/AAB release.

Guest/account namespaces, archives and pending changes remain separate. The cloud database was applied manually; no CLI migration-history claim. Public email delivery still needs verified SMTP/sender and an owned production callback origin. No public leaderboard, shared challenges or bulk Quran offline corpus is activated. Production signing, source permissions, full accessibility, multiple launchers/devices, long Doze/reboot/headphone and two-device conflict acceptance remain explicit gates in RELEASE_READINESS.md. User acceptance is reported as such; private worship records were not independently inspected.

The 0.9.0 baseline is preserved in ANDROID_APK_RELEASE_v0.9.0.md and BUILD_METADATA_v0.9.0.json. Machine-readable current proof is BUILD_METADATA.json; feature/data boundaries are in JOURNEY_V0_10.md and PRIVACY_DATA_MAP.md.
