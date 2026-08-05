# Private Android preview release record — 0.4.1

Package `com.ramadanjourney.preview`, display name **ZAD**, version `0.4.1` / code `6`.

| Gate | Actual status |
|---|---|
| Typecheck / lint / local unit and integration suite | PASS, 33 tests |
| Expo Doctor | PASS, 20/20 |
| Production web export | PASS, with the local Pro Light font |
| Browser split card, ayah selection, sheet resize/dismiss/list scroll | PASS; see READER_SHEETS_V0_4_1.md |
| Local arm64 release build | PASS; final incremental refresh 30s |
| APK v2 signature / manifest / permissions | PASS, same preview certificate and unchanged permission set |
| Runtime source/config/assets compared to build workspace | PASS, all 66 files match |
| Compiled source-map contents compared to final Quran and ReaderSheet files | PASS |
| Packaged Light font and new sheet handle in bundled JS | PASS; font is byte-identical to local source |
| Android install / physical gestures / native keyboard and system navigation / TalkBack | Not performed |
| Public release / Play Store | Not performed |

Artifact relative to repository root: `../ZAD_v0.4.1_arm64.apk`, **32888010 bytes**. Android 7.0+ on 64-bit ARM.

SHA256: `80858c992f689b770bf5120b543afe5b163c26ab5578f7b8c506eb760eb892b6`.

Compiled runtime revision: `d7479030d364f0e3f06e38ee3bfc1407ac382f1a`, with the locally supplied Font Awesome Pro 7.3.1 Classic Light 300 configuration described in `assets/fonts/README.md`. Paid fonts remain outside public Git. The existing package/certificate and higher version code preserve the preview update identity.

The APK bundles JS/fonts/assets and does not require Metro. Quran content requires internet. Manifest inspection confirms Android backup disabled and no microphone, storage, overlay or vibration permissions. The browser checks demonstrate pointer behavior; physical Android gesture, keyboard and accessibility behavior remain separate device gates.

Previous inspected build: `ANDROID_APK_RELEASE_v0.4.md` and `BUILD_METADATA_v0.4.json`.
