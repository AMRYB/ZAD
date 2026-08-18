# Private Android beta release — 0.12.0

ZAD / زاد, package com.ramadanjourney.preview, version 0.12.0 / code 17. Compiled runtime revision: `e06e1ee`. Later documentation/test-only changes do not change the APK.

The Tasbih page now has a curved horizontal onyx-style strand, central counter, slim progress, count/undo/reset controls and full-text remembrance card. Vibration and preset/custom goals use the existing draggable settings sheet. Per-remembrance counts, daily totals, data IDs and core actions are retained; no migration, new permission or dependency is added.

| Gate | Actual result |
|---|---|
| Typecheck / clean lint / TypeScript | PASS; 82 tests |
| Native policy/parser suite | PASS; 26 tests; unchanged native implementation |
| Existing native hardware checks | Seven passed on 0.11.2; not rerun for this UI-only change |
| Browser journeys | PASS; bead/button taps, lateral/downward gestures each add one, undo restoration, phrase isolation, reset-cancel, target validation/Arabic digits, haptic preference toggle and reload persistence |
| Browser layout | Arabic Light 390x844 / English Dark 320x720, long phrase wrapping and no horizontal document overflow; initial preferences restored |
| Web export / Doctor | Export PASS; compatible dependency baseline Doctor 20/20 retained |
| Native build | PASS; 9m 44s, 606 actionable tasks: 578 executed, 28 up-to-date |
| Inputs / compiled JS | PASS; 196 inputs / 47 source-map contents |
| Assets / native helpers | PASS; exact silent nine-second intro, Pro font, all 12 recordings, source-built media patch, launcher/immersion checks; harness excluded |
| Signature / manifest | PASS; existing v2 development signer, ARM64 min24/target36/compile37; no unused microphone/storage/biometric/overlay permissions; embedded Expo config 0.12.0 matches Android version |
| Android installation/startup | PASS; update over existing app without data clear on Android 16; COLD launch 2538ms, no observed own-process errors |
| Physical Tasbih acceptance | Recorded separately in metadata; browser haptic toggle is not a physical vibration claim |

Artifact beside the project: **ZAD_v0.12.0_arm64.apk**, **70,734,092 bytes**.

SHA256: `55186697e0fe4e978ddec6e69845139766f735031025d1b1e62c01140245f8e9`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Existing development/private-preview signer; no production signing claim.

See TASBIH_V0_12_DESIGN.md and BUILD_METADATA.json. Actual prior baseline is archived in ANDROID_APK_RELEASE_v0.11.2.md / BUILD_METADATA_v0.11.2.json. The imagegen attempt produced no asset; beads are locally drawn UI. Existing source/email/signing/accessibility/OEM gates remain in RELEASE_READINESS.md. No public social features, alternate Quran/prayer source or analytics was added.
