# Private Android beta artifact —0.15.0

ZAD / زاد, package `com.ramadanjourney.preview`, **0.15.0 / code22**. Compiled runtime revision: `9dadb0d`. Later verification/documentation commits do not change this APK.

Adds More → Written recall: select a surah/ayah range, write one ayah at a time, review missing/extra words and character differences, show the original reference, retry with an assisted flag, resume position and finish the passage. Bundles unchanged official King Fahd Complex Hafs JSON/font with published archive verification. Existing KSU reader/ESA prayer sourcing remains unchanged. This is spelling review, not recitation/tajweed assessment or government endorsement. No microphone, Tarteel or speech-recognition service.

| Gate | Actual result |
|---|---|
| Typecheck / clean full lint | PASS |
| TypeScript suite | PASS;113 tests, including8 new source/comparison/state/privacy tests |
| Corpus | PASS;6,236 ayahs/114 surahs with matching navigation numbering; both official spellings pass self-comparison |
| Native policy/parser suite | PASS;30 JUnit results, unchanged Gradle tasks may be up-to-date |
| Final production web export | PASS |
| Browser UI | PASS; Arabic390px, missing word, corrected match, assisted retry, original-font reference, next/reload/resume and finish |
| Development server | An initial stale Metro module error and IPv4/IPv6 listener conflict were resolved by stopping the owned servers and starting one clean preview; not a clean whole-session log claim |
| Android build | Initial8m21s,578 executed/28 up-to-date; final UI adjustment1m15s,25 executed/581 up-to-date |
| Source/compiled inputs | PASS;230 input files and69 compiled source modules match |
| Bundled reference | PASS;all12,472 original ordinary/Uthmanic text-field literals present in the Hermes bundle; exact official font hash matches |
| Existing native assets | PASS;13 exact Adhan recordings, Pro font,9s silent intro, bead sound, audio helpers/branding and test-harness exclusion |
| Permissions | No microphone permission; existing foreground-only Qibla permissions retained, no background location |
| Signature/configuration | Existing v2 private preview signer; Android and embedded Expo0.15.0/code22;ARM64,min24/target36/compile37 |
| Installation/launch | PASS; Android16 in-place update from0.14.0; no data clear/uninstall or automatic permission grant |
| Native UI | PASS by direct USB mirror observation: range/ayah5, one missing hamza reported as one letter difference, unchanged original reference rendered with its supplied font |
| Native scope | Correct-answer/reload/finish flows were tested in the browser, not claimed repeated on Android. Owner acceptance of all pre-existing records was not separately collected |
| Runtime errors | Zero ReactNativeJS/AndroidRuntime error lines for the current app process during inspection; not a whole-device/crash-history assessment |
| Dependencies | No new dependency; retained0.14 Doctor19/20 patch advisory and4 high/5 low audit findings, not rerun or claimed clean |

Artifact: **ZAD_v0.15.0_arm64.apk**, **74,252,409 bytes**.

SHA256: `55212ab079a131e58f42bed93757226998cb4c4faa2262f6fbc3da057e30a705`.

Certificate SHA256: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`. Development/private-preview signing, not production signing.

Typed answers are temporary screen state. Last position and up to100 result summaries remain device-local, excluded from optional cloud sync. Existing guest import/local export may include summaries, never the typed text. Prior version-1 records migrate without resetting other fields. See [written recall](WRITTEN_RECALL.md), [metadata](BUILD_METADATA.json), [privacy map](PRIVACY_DATA_MAP.md), and [release readiness](RELEASE_READINESS.md). Previous0.14 evidence is archived separately.

Source/docs are delivered through Git. Private Pro font/recordings, temporary phone-mirroring tools and APK binaries remain excluded. Official developer-resource JSON/font are tracked byte-for-byte with attribution. No new GitHub Release is published. Production signing, public distribution/source review, SMTP, broad accessibility/Doze/device coverage and prior Qibla/Adhan/offline-reader physical gates remain separate.
