# Private Android beta release — 0.11.1

ZAD / زاد, package com.ramadanjourney.preview, version 0.11.1 / code 15. Compiled runtime revision: `4598ad5`. Later documentation-only changes do not change the APK.

Adds ESA-selected-city sunrise/Isha day/night launcher and large Quran/Adhan artwork, plus the supplied 15-second video with Skip/sound. The owner accepted the initial icons/video/Skip on Android. Final rendering is 134% of source size and preserves original PNGs. No schema, package, scheme, account or storage identity changed.

| Gate | Actual result |
|---|---|
| Typecheck / full lint / TypeScript | PASS; 82 tests |
| Native policy/parser tests | PASS; 26 tests |
| Isolated Android16 checks | PASS; day/night/day atomic alias cycle, one launcher, retained process and enlarged native pixels; five timer/widget/artwork regressions; separate harness removed |
| Doctor / production web export | PASS; 20/20 and final web export |
| Native build | PASS; final incremental timings in metadata/build log; Expo Audio built from source |
| Build inputs / compiled JS | PASS; 194 inputs / 46 compiled source contents |
| Assets/native markers | PASS; unchanged original video, Pro font, all 12 audio hashes, guarded media patch, launcher aliases and native receivers; harness excluded |
| Signature/manifest | PASS; existing development v2 signer, ARM64, min24/target36/compile37, no unused microphone/storage/biometric/overlay permissions |
| Installation / launch | PASS; install-r over existing ZAD on Android16, no data clear; reported COLD with 2294ms wait; no observed own-process errors; exactly one active MorningIcon launcher |
| Owner acceptance | Owner confirmed initial artwork/video/Skip and final enlarged launcher/notification size |

Artifact beside the project: **ZAD_v0.11.1_arm64.apk**, **82,466,208 bytes**.

SHA256: `7f74dbd0e707e2d4ae3d9db0b8d26178ed95d2430069cf20b2970cbfef957601`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Development/private preview signing; no Play production claim.

See [branding behavior and limits](BRANDING_V0_11.md) and [machine-readable evidence](BUILD_METADATA.json). Launcher/OEM caching and denied exact alarms can delay changes. No physical overnight boundary, alternate-launcher or API24/25 acceptance is claimed. Existing five high npm audit findings and public email/signing/source/accessibility gates remain in RELEASE_READINESS.md. Prior cloud/widget/Isha acceptance belongs to the archived 0.10.0 record; it was not rerun for this branding change.

Previous verified baseline: ANDROID_APK_RELEASE_v0.10.0.md and BUILD_METADATA_v0.10.0.json.
