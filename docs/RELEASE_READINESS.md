# Private beta release readiness — 0.14.0

The active target is a private, ARM64 Android preview. A built/installed beta is not a Play Store production release.

Selected-city ESA sunrise/Isha launcher and large audio artwork, plus a bundled nine-second silent fullscreen startup video are implemented. Artwork is enlarged following owner feedback. Alternate launchers, physical overnight transitions, API24/25 rendering and OEM battery delays remain acceptance gates. See BRANDING_V0_11.md.

## Delivered functionality

Personalized Home/setup, separate Explore/Settings, date-aware 7/30-day reports, KSU background queued recitation and sleep timer, ESA cached-timetable widget, optional email PKCE accounts and private outbox/CAS sync are implemented. Per-ayah metadata and ZAD notification artwork follow the user's final choice. Source/build/device evidence belongs in ANDROID_APK_RELEASE.md and BUILD_METADATA.json, not inferred from this checklist.

## Public distribution gates still open

- Configure owner-controlled production Android signing, an AAB build, store listing, current target/device compatibility and distribution channel. The preview uses the existing development signer.
- Obtain/record the required source and redistribution permissions for Quran service use, requested private Adhan clips/intros/dua and licensed Pro assets. An endpoint capture is not a license grant. Explicit foreground full-Quran download plans are available in this private build; only a small eight-file sample was transferred during verification. No automatic corpus scan runs.
- Configure a verified email sender/custom SMTP and owned production callback origin. Owner-account PKCE and private sync acceptance do not establish public email delivery. Do not disable Auth protections to bypass delivery limits.
- Publish an owner-reviewed privacy/data-deletion contact and retention policy. PRIVACY_DATA_MAP.md records the actual data flows to support that review; it is not a published policy or a declaration of legal compliance.
- Finish full TalkBack, large system text, alternate launchers, Bluetooth/headphone interruptions, Android/OEM battery restrictions, long Doze/reboot and two-device conflict acceptance. Unit/hosted authorization checks are narrower than these physical scenarios.
- Review the current four high/five low npm audit findings before public release. Doctor is19/20 with patch-alignment advisories; functional verification is not a clean security audit. No forced unrelated dependency upgrade was applied.

## Reproducible media patch

Expo Audio 58.0.10 is explicitly built from source using expo.autolinking.android.buildFromSource. The registered config plugin validates normalized SHA256 hashes before applying three small Android source edits: notification branding, item titles and loaded-duration/artwork refresh. It is idempotent and rejects an unknown source/version. The release verifier checks the applied hashes and the compiled native branding marker; precompiled upstream binaries must not silently replace this customization.

References: [Expo config plugins](https://docs.expo.dev/config-plugins/plugins/) and [Autolinking buildFromSource](https://docs.expo.dev/modules/autolinking/#buildfromsource).

## Tasbih visual revision

The page is redesigned using local native gradient/textured beads and existing counting/storage rules. Browser gesture/count, settings and RTL/LTR layout checks pass. Physical count/haptic/gesture acceptance is recorded separately in release metadata; full TalkBack, large system text and broader OEM interaction testing remain separate gates.

## Current device acceptance

The0.14.0 artifact has a real Android16 update/startup check and direct final Qibla/clock/arc/settings interaction. Surveyed compass accuracy, fresh permission-dialog retest after the repair, native offline airplane mode, full audible Adhan interruption and broad device/Doze/TalkBack acceptance remain separate gates. Current Doctor19/20 patch advisories and4 high/5 low audit findings are not a clean dependency assessment. See ANDROID_APK_RELEASE.md.

## Written recall0.15.0

Private Android16 update/launch and missing-hamza review/original-font rendering observed. Browser correction/retry/reload/resume/finish and source/state/privacy tests PASS. This is spelling review, not voice/tajweed assessment. Source availability/provenance and official byte hashes are documented in WRITTEN_RECALL.md; no government app endorsement. No new dependency or permission. Prior production/signing/source review, accessibility/Doze/device and dependency gates remain open.
