# Private Android preview release record — 0.3.0

Package `com.ramadanjourney.preview`, version `0.3.0` / code `3`.

| Gate | Actual status |
|---|---|
| Typecheck / lint / 28 tests | PASS |
| Expo Doctor | PASS, 20/20 |
| Production web export | PASS |
| Browser page drag, zoomed pan and upward card cycles | PASS for the checks in READER_GESTURES_V0_3 |
| Local arm64 release build | PASS — initial 5m 49s; final source revision 51s |
| APK v2 signature / manifest / minimal permissions | PASS |
| Source/config compared to actual build workspace | PASS — all 44 files match |
| Update signing identity | Same certificate/package as 0.2; version code increased |
| Actual Android install / two-finger touch / native smoke | Not performed |
| Public release / Play Store | Not performed |

Artifact: `../Ramadan_Journey_v0.3.0_arm64.apk`, **32617422 bytes**. Requires Android 7.0+ on 64-bit ARM.

SHA256: `ec70fff305d2db315522004ac797bea91fe7c4f2323248e7435f92e028347255`.

Compiled code revision: `5ab9a688c56ee2a3d4a0cf9e2f3f59b1ca639a21`. See `BUILD_METADATA.json`. The source was compared after all final card-label and drag-threshold changes; temporary gesture diagnostics are absent. Manifest inspection confirms backup disabled and no microphone, storage, overlay or vibration permissions.

The APK uses the existing Android debug certificate for this private preview and bundles JS/assets without requiring Metro. Quran content requires internet access. Browser drag checks and gesture-controller tests do not constitute a physical Android multitouch or installation test.

Historical evidence: `ANDROID_APK_RELEASE_v0.2.md`, `BUILD_METADATA_v0.2.json`, and `BUILD_METADATA_v0.1.json`.
