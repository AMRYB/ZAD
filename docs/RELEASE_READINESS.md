# Private beta release readiness — 0.11.1

The active target is a private, ARM64 Android preview. A built/installed beta is not a Play Store production release.

Selected-city ESA sunrise/Isha launcher and large audio artwork, plus a bundled skippable startup video are implemented. Artwork is enlarged following owner feedback. Alternate launchers, physical overnight transitions, API24/25 rendering and OEM battery delays remain acceptance gates. See BRANDING_V0_11.md.

## Delivered functionality

Personalized Home/setup, separate Explore/Settings, date-aware 7/30-day reports, KSU background queued recitation and sleep timer, ESA cached-timetable widget, optional email PKCE accounts and private outbox/CAS sync are implemented. Per-ayah metadata and ZAD notification artwork follow the user's final choice. Source/build/device evidence belongs in ANDROID_APK_RELEASE.md and BUILD_METADATA.json, not inferred from this checklist.

## Public distribution gates still open

- Configure owner-controlled production Android signing, an AAB build, store listing, current target/device compatibility and distribution channel. The preview uses the existing development signer.
- Obtain/record the required source and redistribution permissions for Quran service use, requested private Adhan clips/intros and licensed Pro assets. An endpoint capture is not a license grant. No bulk Quran download is enabled.
- Configure a verified email sender/custom SMTP and owned production callback origin. Owner-account PKCE and private sync acceptance do not establish public email delivery. Do not disable Auth protections to bypass delivery limits.
- Publish an owner-reviewed privacy/data-deletion contact and retention policy. PRIVACY_DATA_MAP.md records the actual data flows to support that review; it is not a published policy or a declaration of legal compliance.
- Finish full TalkBack, large system text, alternate launchers, Bluetooth/headphone interruptions, Android/OEM battery restrictions, long Doze/reboot and two-device conflict acceptance. Unit/hosted authorization checks are narrower than these physical scenarios.
- Review the five existing high npm audit findings through the Expo CLI/code-signing/node-forge/zod chain before public release. Compatible SDK patch alignment and Doctor 20/20 do not mean a clean security audit. No forced breaking dependency upgrade was applied.

## Reproducible media patch

Expo Audio 58.0.10 is explicitly built from source using expo.autolinking.android.buildFromSource. The registered config plugin validates normalized SHA256 hashes before applying three small Android source edits: notification branding, item titles and loaded-duration/artwork refresh. It is idempotent and rejects an unknown source/version. The release verifier checks the applied hashes and the compiled native branding marker; precompiled upstream binaries must not silently replace this customization.

References: [Expo config plugins](https://docs.expo.dev/config-plugins/plugins/) and [Autolinking buildFromSource](https://docs.expo.dev/modules/autolinking/#buildfromsource).
