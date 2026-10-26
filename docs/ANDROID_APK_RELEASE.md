# Private Android beta artifact — 0.12.1

ZAD / زاد, package com.ramadanjourney.preview, version **0.12.1 / code 18**. Compiled runtime revision: `7391f90`. Later documentation-only commits do not alter the APK.

The owner's follow-up corrects the bead strand to have an open centre, a visible upward arch and individual bead transfer/contact/rebound with outer-edge replenishment. The lower count controls use the available screen height; short screens still scroll. Existing storage, counts and haptics are retained. See [design and motion](TASBIH_V0_12_1_DESIGN.md).

**Installation and physical-device testing have not been performed for this version.** The owner explicitly chose an APK to test later. The accepted Android 0.12.0 baseline is archived separately and is not acceptance of the revised shape or animation.

| Gate | Actual result |
|---|---|
| Typecheck / clean lint / TypeScript | PASS; 82 tests |
| Native parser/policy suite | PASS; 26 tests; native implementation unchanged |
| Production web export | PASS; final curvature and growing layout |
| Browser interactions | PASS; tap/rapid taps/lateral drag, no duplicate count, undo, nonzero reload persistence, settings sheet |
| Browser layout | Arabic Light390x844; English Dark320x720; lower controls accessible through scroll, no horizontal document overflow; original preferences and count restored |
| Native build | PASS; 9m 13s, 606 actionable tasks: 578 executed, 28 up-to-date |
| Inputs / compiled JS | PASS; 196 inputs / 48 compiled source contents, including TasbihBeads, Tasbih screen and shared Screen |
| APK configuration/assets | PASS; embedded Expo0.12.1 and Android0.12.1/code18; exact font,12 recordings and silent9s intro; existing source-built audio/alias/immersion checks; harness excluded |
| Signature / permissions | PASS; existing v2 preview signer, ARM64 min24/target36/compile37; blocked unused permissions remain absent |
| Physical Android acceptance | NOT RUN for0.12.1; owner will test the APK later |
| Unchanged baseline checks | Doctor20/20 and seven0.11.2 hardware checks retained, not rerun for this UI revision |

Artifact beside the project: **ZAD_v0.12.1_arm64.apk**, **70,735,296 bytes**.

SHA256: `f6e4b29ede9f648fada4f9bad9f757c34b988ddb0f23b53a87a803f1675c27e9`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Existing development/private-preview signer; no production signing claim.

No permission, dependency, provider, storage identifier or schema is added. Existing production gates and five earlier high audit findings remain in RELEASE_READINESS.md. No0.12.1 GitHub Release has been published by this work.
