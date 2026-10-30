# ZAD | Ã˜Â²Ã˜Â§Ã˜Â¯

ZAD is an Arabic-first Expo / React Native application for private daily tracking, Quran reading, listening and personal reading plans.

## Current source and release status

Current source and built private Android artifact: **0.14.0 / code21**. Adds a local opt-in Qibla guide with true-north/quality instructions, centralized Adhan settings, and an animated official-time prayer-day arc with current clock, next prayer and gray elapsed rows.

Typecheck/clean lint, **105 TypeScript tests**, **30 native unit tests**, web export, APK verification and Android16 update/startup PASS. Direct phone interaction verified the corrected real compass arrow, Stop/reacquire and prayer-day UI. An initial no-arrow candidate was repaired before delivery. **Physical compass accuracy is not guaranteed or surveyed.** Doctor19/20 has patch-alignment advisories; the audit retains4 high/5 low findings. See [release evidence](docs/ANDROID_APK_RELEASE.md), [metadata](docs/BUILD_METADATA.json), [Qibla design](docs/QIBLA_V0_14.md), [prayer-day design](docs/PRAYER_DAY_V0_14.md) and [release readiness](docs/RELEASE_READINESS.md).

The original Android package `com.ramadanjourney.preview`, deep-link scheme and local storage identifiers are retained to preserve existing preview data. Product requirements are available in `docs/source-plan/`.

The private preview uses locally supplied Font Awesome Pro 7.3.1 Light icons. Licensed assets are excluded from Git; a clean checkout uses Free fallback fonts. See `assets/fonts/README.md` for the local setup.

## Repository

[GitHub: AMRYB/ZAD](https://github.com/AMRYB/ZAD). The root contains the maintained mobile project; `legacy-web/` contains the archived web implementation.

## Implemented application

- Arabic first launch, English setting, explicit RTL/LTR layout, persisted system/light/dark appearance.
- Cairo Regular/Bold bundled with the app; Emerald Light and Navy/Gold Dark palettes.
- Local onboarding, dashboard with reconciled counts, five prayer records, fasting status, private daily notes, recurring daily habits.
- Editable daily records, bounded personal goal counters, multiple independent reading plans, explicit page completion, undo, and catch-up assignments.
- Configurable 29/30-day season and calendar; no invented Ramadan date; date/timezone and Arabic-number input handling.
- KSU original Mushaf PNGs, scaled ayah overlays, page/surah/ayah navigation, last selection, bookmarks, 41 selectable Hafs recording options, five Arabic tafsirs, pause/resume/repeat, complete-page/fill-width display, direct pinch zoom/pan, deliberate page swipes, sideways cycling control cards, freely resizable/dismissible reader sheets and split immersive controls.
- Native SQLite persistence. Browser preview uses localStorage as a separate adapter.
- More Ã¢â€ â€™ Adhan: 82 saved city choices from the Egyptian Survey Authority, today/tomorrow/week and custom-date timetables, native exact prayer alarms, ten-minute reminders, offline per-prayer Tobar/Shuaisha/Husary/Rifaat recordings, MBC intros, a Friday Al-Azhar override and notification stop. The screen exposes permission, volume and schedule-coverage status.
- JSON backup export and validated import, with confirmation before replacing device records.

## Run

Node.js 24 is the tested runtime. Install the exact dependency tree:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run doctor
npm run web
```

On this Windows host, a loopback-only web preview was started with `$env:NODE_OPTIONS="--dns-result-order=ipv4first"; npx.cmd expo start --web --localhost --port 8082`. This is a process-local IPv4 binding fix, not a public network exposure.

Open the URL printed by Expo. The development web preview includes a strictly allowlisted KSU relay because KSU `interface.php` does not send CORS headers. Native Android calls the original KSU endpoints directly. See [API_CONTRACT.md](docs/API_CONTRACT.md).

Prayer times come exclusively from ESA's [official page](https://www.esa.gov.eg/praytimes.aspx), using its linked monthly form; there is no local astronomical or alternate-provider fallback. Android calls ESA directly and refreshes cached months through its local module. Web uses a fixed-source relay. Read [ESA_API_DOCUMENTATION.md](docs/ESA_API_DOCUMENTATION.md). Background Adhan requires the Android build, notification permission and Alarms & reminders access; it does not run from browser timers. Prayer-specific recordings and intros are locally prepared for the private build; public setup and hashes are documented in [ADHAN_AUDIO_V0_6.md](docs/ADHAN_AUDIO_V0_6.md).

```bash
# Native debug build, when an Android device/emulator is available:
npx expo run:android

# Hosted internal APK build; requires your own Expo account/project:
npx eas-cli@latest build --platform android --profile preview
```

For Windows local release building, see [ANDROID_BUILD.md](docs/ANDROID_BUILD.md). The repository contains reproducible source/configuration; generated `android/`, `node_modules/`, database test files and credentials are excluded from Git and the source archive.

## Database

The running app stores private data locally by default, with optional accounts and private cloud copies. Its personal XP ledger is local-only and must never be imported as a trusted cloud XP balance. `supabase/migrations/20261023000100_private_core.sql` additionally prepares a cloud database foundation: own-user RLS, revision-based snapshot sync, server-controlled participation XP, capped/deduplicated awards, opt-in leaderboard projection, blocks, and account-data deletion. These SQL behaviors are tested with PostgreSQL via PGlite, using a test-only Auth shim.

A dedicated Supabase project was created by the user and its private schema applied. Real hosted role/RLS/CAS/replay/deletion checks passed with rolled-back synthetic records; anonymous access was denied. Optional email PKCE, guest import, isolated local account caches, durable outbox and explicit conflict resolution are implemented. They do not expose worship records publicly or turn personal XP into trusted server XP. Public email rollout requires verified SMTP and a production callback origin. Read [DATABASE.md](docs/DATABASE.md) for contracts and [JOURNEY_V0_10.md](docs/JOURNEY_V0_10.md) for actual mobile verification limits.

## Verification and scope

- [QA_REPORT.md](docs/QA_REPORT.md): actual checks, browser evidence, native-build/device status and limitations.
- [DELIVERY_PLAN.md](docs/DELIVERY_PLAN.md): corrected IDs, first-preview scope, later phases and truthful status.
- [SCREEN_MATRIX.md](docs/SCREEN_MATRIX.md): actual routes and sheets.
- [DESIGN.md](docs/DESIGN.md): typography, tokens, directional layout and interaction choices.
- [Reader revision](docs/READER_V0_2_DESIGN.md): reference research, layout, source catalogue and verification limits.
- [Gesture revision](docs/READER_GESTURES_V0_3.md): interactions, final card design and actual verification limits.
- [CHANGELOG.md](CHANGELOG.md): implemented changes.
- [Source attribution and API provenance](docs/SOURCE_ATTRIBUTION.md): maintained for GitHub/project documentation.
- [Third-party notices](THIRD_PARTY_NOTICES.md).

This is a private development preview, not a declaration that every future feature in the master plan has shipped. Six sourced Adhkar sections are implemented; additional reviewed lessons, social challenges, Family and optional AI remain later work. Adhan-specific notifications are implemented; general habit/reminder campaigns remain separate. Public distribution also requires the KSU usage review specified in the supplied plan.
