# Private Android preview release record — 0.6.1

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.6.1` / code `9`.

This media-only patch removes exactly the first 5.6 seconds of the Tobar Isha Adhan. The preceding MBC Isha intro and the eleven other files retain their 0.6.0 bytes. Prayer scheduling, playback logic, permissions, storage identifiers and Friday selection are unchanged. See `ADHAN_AUDIO_V0_6.md` for source and sample-level trim provenance.

| Gate | Actual status |
|---|---|
| Typecheck / lint / TypeScript suite | PASS, 44 tests |
| Native release-variant JUnit | PASS, 11 tests: six ESA + five sequence/date |
| Exact trim | PASS, 246960 samples per channel at 44100 Hz; retained decoded length and zero-offset waveform correlation 0.99998578 verified |
| Other recordings | PASS, all eleven files byte-identical, including Isha intro |
| Local web audio | PASS, edited Isha and original intro returned 200 audio/mpeg with matching hashes after restart |
| Local arm64 release build | PASS, 7m 36s |
| APK v2 signature / manifest | PASS, same preview certificate, version 0.6.1/code 9, unchanged permissions |
| Build inputs / compiled sources | PASS, 107 source/config/asset files and seven compiled JavaScript sources |
| Private font / packaged audio / optimized helpers | PASS, exact Light font, all twelve MP3 hashes, catalogue and R8 residual mappings; harness excluded |
| Actual Android update and launch | PASS, installed over 0.6.0 on Android 16; status ok, process alive, no own-process AndroidRuntime/ReactNativeJS errors observed |
| Actual permissions | Notification and Alarms & reminders access retained |
| Trimmed Isha user listening / new locked-screen alarm run | Not repeated for this patch |
| Previous product Friday locked-screen acceptance | User confirmed notification → Friday intro → Al-Azhar Adhan on 0.6.0 before requesting this patch; archived separately |
| Expo Doctor / production web export | Not rerun: unchanged dependency baseline remains 19/20 with five patch advisories; 0.6.0 export passed |
| Deep Doze / reboot / DND / long-term OEM behavior / TalkBack | Not device-tested |
| Public release / Play Store | Not performed |

Artifact relative to repository: `../ZAD_v0.6.1_arm64.apk`, **44523836 bytes**, Android 7.0+ / ARM64 only.

SHA256: `761b023871732cd92a95d653a83911768a3ed037574d277a50678de2fb0197ee`.

Compiled runtime revision: `1529c26fc61504b8584f9f174614178f59c30be0`. Later documentation commits do not change the runtime. Startup returned `UNKNOWN (0)` and is not asserted as a cold launch. Private prepared recordings and licensed Font Awesome Pro assets remain outside public Git. Matching catalogue hashes cause native extraction to replace the old cached Isha recording. User data was not cleared.

Previous complete release evidence: `ANDROID_APK_RELEASE_v0.6.0.md` and `BUILD_METADATA_v0.6.0.json`. This patch does not claim the previous six-sequence or locked-screen checks were rerun.
