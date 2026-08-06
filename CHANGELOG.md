# Changelog

## 0.6.0 — prayer-specific voices and Friday audio

- Added a hash-pinned twelve-clip catalogue: five ordinary MBC intros, one Friday intro and six Adhan recordings, with separate Tobar Fajr/Isha sources.
- Assigned Tobar to Fajr/Isha, Shuaisha to ordinary Dhuhr, Husary to Asr, Rifaat to Maghrib, and the user-selected Al-Azhar recording to Friday Dhuhr only, using the saved Cairo calendar date.

- Added sequential native playback and per-prayer previews, with matching private bundled recordings, all-file hash checks, one stop action and a duration bound that accommodates the longer Tobar recordings.
- Fixed rapid stop/start lifecycle races and cleared pending audio after stopping an intro. All six native sequences and intro-stop were exercised on Android 16.
- Replaced the single audio relay with a validated local clip selector; malformed/extra/duplicate selectors fail closed.

## 0.5.0 — reader balance and Egyptian prayer times

- Centered immersive playback exactly between equal-width ayah and text-only tafsir controls; removed the tafsir icon from this card.
- Removed navigation-card page arrows and aligned surah, ayah and page chips at a shared height. Existing page swipes and the upper surah dropdown remain available.
- Added an ESA-only monthly timetable parser and bounded web relay, 82 authoritative city options with bilingual display names, Cairo timezone/DST conversion, strict response validation and migration-safe Adhan settings.
- Added More → Adhan with saved city selection, today/tomorrow/week and custom-date views, next-prayer emphasis, optional reminders and Egyptian Adhan preview.
- Added a local Android module for exact prayer alarms, ten-minute reminders, offline verified Mohamed Rifaat audio, foreground playback with notification stop, daily source refresh and boot/time-change restoration.
- Added explicit notification/exact-alarm setup, a muted-alarm-volume warning, safe cancellation on settings changes and a separate reproducible hardware-test APK. Real-phone background/stop/cancellation and cold-process playback were tested; the user confirmed audible playback after raising the phone's alarm volume.
- Built and verified the private arm64 APK, installed it over 0.4.1 and completed the final product's city/permission/scheduling flow. The user confirmed the test notification and audible Adhan with the screen locked. Release metadata distinguishes this from remaining deep-Doze/reboot and reader-device gates.

## 0.4.1 — draggable reader sheets

- Split the immersive card into equal sections: ayah selection on the Arabic right, playback and tafsir on the left; removed the page chip and page arrows from this card.
- Added a directly draggable sheet handle for all reader pickers, free intermediate heights, downward dismissal, list-scroll arbitration and viewport bounds. Close/backdrop controls remain available.
- Added accessible height actions, web keyboard resize/close support, and regression coverage for drag, cancellation, dismissal and scroll ownership.

## 0.4.0 — reader controls and icon polish

- Unified UI icons through Font Awesome 7.3.1; the private build uses locally supplied Pro Classic Light 300. Public source includes Free fallback fonts and a local installer for licensed assets.
- Changed control-card cycling to either lateral direction with simultaneous outgoing/incoming animation and guards against presses during transitions. Removed the visible grab-line and its reserved row.
- Added audio-progress spacing, a five-column immersive toolbar with centered playback, and separate image/safe-area gaps outside the clipped zoom canvas.
- Restored the upper surah dropdown arrow and selection in normal and immersive modes.
- Added real font glyph/weight checks and lateral-gesture regression coverage; release evidence is recorded separately.

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
- Added provider/layout verification; native/browser release gates are recorded separately.

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
