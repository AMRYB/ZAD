# Private Android beta artifact — 0.13.0

ZAD / زاد, package `com.ramadanjourney.preview`, version **0.13.0 / code20**. Compiled runtime revision: `bdde9a9`. Later documentation-only commits do not alter this APK.

This build adds original KSU offline content downloads from More → Settings, the supplied Sha'rawy dua after every Adhan, retained duck/pause/resume handling for audio-focus loss, and independent finger-following Tasbih pull capture. The automatic-save footer is removed. Both accepted Isha trims, existing counters, account data, icon size and silent nine-second intro are retained.

**Installation smoke and physical playback/touch/offline testing have not been performed for this version.** No authorized ADB phone is connected; the owner previously chose an APK for later testing. The last physically accepted version is0.12.0. Policy tests are not evidence of real notification interruption or audibility.

| Gate | Actual result |
|---|---|
| Typecheck / clean full lint | PASS |
| TypeScript source suite | PASS;95 tests, including10 offline and2 direct-pull tests |
| Native parser/policy suite | PASS;30 tests, including4 audio-focus policy tests |
| Production web export | PASS; new screen, strict relay and local-media paths |
| Browser downloads | PASS;8 files /267.7KB: page602 PNG/highlights, Husary108 and Ibn Katheer108; complete after reload and later reopen; no bulk download |
| Cached reader integration | PASS; page602 uses a local blob with overlays, saved tafsir108:1 opens, Husary108:1 time advances0–8seconds; original observed106:1 selection restored |
| Tasbih browser input | PASS; short20px drag adds zero; left/right/down each add one; original21 count/zero current-day total restored; sentence absent at390×844 |
| Browser logs | No captured reader application errors; one browser touch-end warning during viewport change, not treated as a clean warning-free session |
| Final native incremental build | PASS;1m53s;606 tasks:39 executed,567 up-to-date; includes final explicit-stop callback guard |
| Source/assets / compiled JavaScript | PASS;212 compared inputs /57 compiled sources |
| Private recordings | PASS;13 exact hashes including30.174354-second dua; preceding12 recordings unchanged |
| Retained native/assets checks | PASS; original font, bead WAV, silent9s intro, native media patch, branding aliases, R8 helpers including focus policy, harness exclusion |
| Signature/configuration | PASS; v2 existing preview signer, Android/embedded Expo0.13.0/code20;ARM64,min24/target36/compile37; no new permissions or dependencies |
| Device installation / locked-screen notification interruption / full audible queue | NOT RUN |
| Native offline files / native direct touch / airplane mode / full Quran transfers | NOT RUN |
| Baseline advisory gates | Doctor20/20 retained for unchanged dependencies; five pre-existing high audit findings remain; no new clean-audit claim |

Artifact: **ZAD_v0.13.0_arm64.apk**, **71,153,583 bytes**.

SHA256: `971d0cff28805f61cb9bc408ff0655deeaeec8134aff48eb79ec8f96ee1c6712`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Existing development/private-preview signer; no production-signing claim.

Source details: [Offline downloads](OFFLINE_QURAN_V0_13.md), [Dua and focus](ADHAN_DUA_AND_FOCUS_V0_13.md), [Direct bead pulling](TASBIH_PULL_V0_13.md), and [machine-readable metadata](BUILD_METADATA.json). Previous evidence is archived in BUILD_METADATA_v0.12.2.json and ANDROID_APK_RELEASE_v0.12.2.md.

Phone acceptance should cover update without clearing records; saved reader content in airplane mode; an ordinary audible notification while Adhan plays; manual mute, stop and late focus gain; full intro/Adhan/dua including Friday; and actual bead drag/sound/haptics. These checks remain pending rather than inferred from compilation.

The source/docs are delivered through Git. Private licensed fonts/audio, private stream metadata and the APK are not added to repository history. This work does not publish a new GitHub Release. Public distribution still has the existing source-rights, production signing, SMTP and accessibility/Doze gates in RELEASE_READINESS.md.
