# Private Android preview release record — 0.4.0

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.4.0` / code `5`.

| Gate | Actual status |
|---|---|
| Typecheck / lint / 30 local tests | PASS, including actual Pro Light 300 glyph checks |
| Expo Doctor | PASS, 20/20 |
| Production web export with local Light font | PASS |
| Browser reader controls, lateral cards and zoomed immersive layout | PASS; see READER_POLISH_V0_4.md |
| Local arm64 release build | PASS, 11m 19s |
| APK v2 signature / manifest / minimal permissions | PASS |
| Runtime source/config/assets compared to build workspace | PASS, 64 files match; documentation is outside this comparison |
| Packaged Pro Light font compared to local font | PASS, byte-identical; font family also present in bundled JS |
| Update signing identity | Same package/certificate as 0.3, higher version code |
| Actual Android install / native gestures / three-button navigation / TalkBack | Not performed |
| Public release / Play Store | Not performed |

Artifact, relative to repository root: `../ZAD_v0.4.0_arm64.apk`, **32882338 bytes**. Android 7.0+ on 64-bit ARM.

SHA256: `7b8bf6d9b948ac1679e84025a67905100b3f96bb8959fc3285e474066caaa157`.

Compiled runtime revision: `a1e6ef89bb46cb8a01b080c4389d8cf0195fe6a7`, with the separately supplied local Pro icon configuration described in `assets/fonts/README.md`. The public checkout contains Free fallback fonts and the installer, while this private APK uses **Font Awesome Pro 7.3.1 Classic Light 300**. R8 resource optimization names the packaged font `res/7V.otf`; its bytes match local SHA256 `46e24a495ff52fdbb821cfaf1a6eb033a81ecd63c3e2cb99bd14789810190392`.

The build bundles JS/fonts/assets and does not require Metro. Quran content requires internet. The existing Android debug signing identity is retained for this private preview. Manifest inspection confirms backup disabled and no microphone, storage, overlay or vibration permissions. Browser geometry does not substitute for Android system-navigation testing.

Previous release records: `ANDROID_APK_RELEASE_v0.3.md`, `BUILD_METADATA_v0.3.json`, and the earlier versioned records.
