# Private Android beta artifact â€” 0.12.2

ZAD / Ø²Ø§Ø¯, package com.ramadanjourney.preview, version **0.12.2 / code19**. Compiled runtime revision: `d6da5a9`. Later verification/documentation-only commits do not alter the APK.

Green stone beads retain the arch and centre gap. The original short bead effect plays once at forward first contact, with an independent saved Bead sound switch in Tasbih settings. Android uses SoundPool without requesting audio focus or touching global audio mode/device volume. See [sound design](TASBIH_V0_12_2_SOUND.md).

**Installation, physical audibility and simultaneous recitation/Adhan playback have not been tested for this version.** The owner chose an APK for later testing. The last physically accepted version is0.12.0;0.12.1 was also delivered for later testing.

| Gate | Actual result |
|---|---|
| Typecheck / clean lint / source tests | PASS;83 tests, including old snapshot compatibility, false sound preference round-trip, retained nonzero records and independent haptics |
| Native policy/parser suite | PASS;26 tests; SoundPool audibility is not covered by these JVM tests |
| Web export | PASS; green beads, local WAV and settings |
| Browser UI | PASS; green beads/count/undo, sound off persists across full reload while haptics stays on; initial nonzero count and enabled sound restored; Arabic Light390x844 and English Dark320x720 settings; original language/theme restored; no captured fresh-tab errors/warnings |
| Native build | PASS;8m 32s,606 actionable tasks: 578 executed, 28 up-to-date |
| Inputs / compiled JS | PASS;200 inputs /49 compiled sources including Android sound hook |
| Sound asset / native helper | PASS; exact PCM bytes/hash in optimized `res/Ul.wav` and R8 helper/bridge verification; original90ms effect has no clipping or third-party source |
| Existing assets/helpers | PASS; exact font,12 recordings and silent9s intro; source-built media patch/aliases/immersion checks; harness excluded |
| Signature/configuration | PASS; existing v2 preview signer; Expo/Android0.12.2/code19;ARM64,min24/target36/compile37; no new permissions |
| Physical sound/concurrency/installation | NOT RUN; owner will test APK later |
| Baseline gates | Doctor20/20 retained for unchanged dependencies; prior seven0.11.2 hardware checks not rerun and do not validate SoundPool |

Artifact: **ZAD_v0.12.2_arm64.apk**, **70,741,872 bytes**.

SHA256: `536caed28d72ced3022632cfd7d752bec5eabbb9f3fdec2727e9b6ed31de5268`.

Bead WAV SHA256: `f2608660758b7ea430bd4255dbba04831d26c9d9854640d35f7bae2858efe943`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Existing development/private-preview signer; no production signing claim.

Existing production gates and earlier audit findings remain in RELEASE_READINESS.md. Source/docs are delivered through Git; no0.12.2 GitHub Release is published by this work.
