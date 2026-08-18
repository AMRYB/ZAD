# Private Android beta release — 0.11.2

ZAD / زاد, package com.ramadanjourney.preview, version 0.11.2 / code 16. Compiled runtime revision: `39e1dd8`. Later documentation-only commits do not change this APK.

The startup clip now contains exactly the original first nine seconds, without audio or buttons. Cover rendering fills the screen with proportional cropping. Scoped Android immersion hides status/navigation bars during playback and restores prior visibility/behavior afterward. The accepted day/night artwork and private journey data are retained.

| Gate | Actual result |
|---|---|
| Typecheck / full lint / TypeScript | PASS; 82 tests |
| Native policy/parser tests | PASS; 26 tests |
| Video preparation | PASS; 9.000 seconds, 270 original decoded frames, no audio, no re-encoding |
| Browser / web export | PASS; cover across 390x844, zero intro buttons, nine-second duration and automatic Home transition; viewport reset |
| Android regression checks | PASS; six alias/timer/widget/artwork checks in separate harness |
| Native immersion check | PASS; hides status/navigation bars and restores original state after repeated entry on unlocked Android16 |
| Native build | PASS; 2m 13s, 606 actionable tasks: 39 executed, 567 up-to-date; customized Expo Audio compiled from source |
| Inputs / compiled JS | PASS; 195 inputs / 46 source-map contents |
| Packaged assets/native helpers | PASS; exact prepared clip, Pro font, all 12 audio hashes, guarded media patch, R8 bar helper and alias declarations; test harness excluded |
| Signature / manifest | PASS; existing v2 development signer, ARM64, min24/target36/compile37; no unused microphone/storage/biometric/overlay permissions |
| Installation / launch | PASS; install-r over existing ZAD on Android16, no data clear; reported WARM, wait 1737ms; no observed own-process errors; one active launcher |
| Owner intro acceptance | Owner confirmed fullscreen/no buttons, nine-second transition and normal system-bar restoration |

Artifact beside the project: **ZAD_v0.11.2_arm64.apk**, **70,728,968 bytes**.

SHA256: `d160afc8bc82bd62023ea1c9b45e64fa72da7744b9895d384da26879e8eff2b5`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Development/private preview signing; no public Play release claim.

See BRANDING_V0_11.md, BUILD_METADATA.json and RELEASE_READINESS.md for behavior, proof and remaining production gates. Prior baseline: ANDROID_APK_RELEASE_v0.11.1.md / BUILD_METADATA_v0.11.1.json. Day/night overnight transitions, alternate launchers and API24/25 still require physical acceptance. Existing audit/email/signing/source/accessibility gates remain open.
