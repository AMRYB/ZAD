# Changelog

## 0.3.1 — ZAD source rename

- Renamed the application display name/project slug to ZAD and the Arabic interface brand to زاد.
- Updated backup export names while preserving the original Android package, deep-link scheme, SQLite filename, web storage key and backup format for compatibility with installed previews.
- The last verified APK is the earlier 0.3.0 build; this source branding revision has not been rebuilt or installed on Android.

## 0.3.0 — direct reader gestures

- Added two-finger focal zoom, one-finger bounded panning, and directional page swipes at normal size; pinches and zoomed pans cannot accidentally turn pages.
- Added a player/navigation card stack that cycles upward with a drag, including reduced-motion handling and an accessible grab-handle alternative.
- Moved surah/ayah/page selection into the navigation card. Removed visible card titles/switch buttons, used a text-only surah label, and enlarged the page selector at the user’s request.
- Kept images and all ayah overlays on the same transformed source plane and retained manual zoom options for accessibility.
- Added five gesture regression tests (28 total tests). Browser and native-test limits are recorded separately.

## 0.2.0 — reader revision

- Added a sourced catalogue of 41 Hafs recording choices and five Arabic tafsirs with persisted preferences.
- Added safe migration of earlier version-1 snapshots without losing private records.
- Replaced the reader’s large action stack with a compact player, circular transport actions and searchable bottom sheets.
- Added complete-page/fill-width geometry, uniform image/overlay zoom, and immersive reading with a compact toolbar.
- Added authentic Git delivery documentation and provider/layout verification; native/browser release gates are recorded separately.

- Moved provider attribution out of application copy into repository documentation at the user’s request; retained original endpoints, evidence and content integrity.
- Verified the revised browser reader and signed arm64 APK (installation remains a separate gate).

## 0.1.0 — initial private preview

- Created an Expo 58 / React Native 0.88 TypeScript application and real dependency lockfile.
- Added Arabic-first onboarding, Cairo typography, persistent English and two locked themes.
- Implemented local records, private notes, daily habits, goals, calendar and reading-plan flows.
- Reused verified KSU metadata and geometry; added original-page image rendering, overlays, navigation, bookmarks, Husary audio lifecycle and safe Saadi text.
- Added an allowlisted web-only KSU relay for the observed CORS restriction; native stays direct to KSU.
- Implemented local SQLite persistence and tested a PostgreSQL cloud-foundation migration.
- Added validated JSON backup export/import with explicit replacement confirmation and screen-draft reset.
- Added safe fallback navigation for directly loaded plan/calendar routes.
- Disabled inherited Android automatic backup and blocked unused overlay/vibration permissions for the private local preview.
- Added meaningful domain, geometry, relay, SQLite and PostgreSQL tests and a CI check workflow.
- Recorded actual browser checks and native-build/device limitations without inventing earlier milestones.
