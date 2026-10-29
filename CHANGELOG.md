# Changelog

## 0.13.0 — offline Quran, follow-up dua and direct bead pulling

- Added More → Settings downloads for original Mushaf pages/highlights, a chosen reciter and a chosen tafsir, with bounded foreground requests, progress, pause/resume, private storage, safe validation and shared-file-aware removal. The reader prefers saved content.
- Appended the supplied Sha'rawy dua after each prayer/Friday Adhan. Existing recordings and both Isha trims remain unchanged.
- Replaced destructive audio-focus loss with ducking or retained pause/resume, preserving manual mute/stop and rejecting stale callbacks.
- Fixed actual bead-drag capture and finger-following motion, with one count per deliberate pull; removed the automatic-save footer and reduced bottom padding.
- Typecheck/lint,95 TypeScript tests,30 native policy tests, web export and release verification pass. Physical installation, interruption, full sequence and native offline tests remain pending; see the release record.

## 0.12.2 — emerald beads and optional collision sound

- Recolored the stone beads in emerald green while retaining their arch, open centre, texture and movement.
- Added an original bundled 90ms bead-tap effect, fired once at the animation's first contact knot. Reduced-motion counting plays the feedback immediately; undo, opening the page and restoring records remain silent.
- Added a separately persisted Bead sound switch beside the existing vibration setting. Older records without this optional field remain readable and retain their counts.
- Android uses a foreground SoundPool effect without requesting audio focus, changing phone volume or creating media notifications. Leaving the screen, backgrounding the app or muting the setting stops the effect.

## 0.12.1 — reference bead gap and transfer

- Split the strand into two close-packed stone banks with a visible open centre, a stronger upward arch and a subtle curved cord.
- A single bead crosses the gap, contacts the receiving bank and settles with a small rebound; the outer bead exits while its replacement enters at the other edge. Quick counts queue transfers; undo reverses the motion.
- Moved the count controls below the remembrance/statistics and distributed surplus screen height around the bead/counter region instead of leaving unused space below the controls. Short screens still scroll.
- Retained existing counters, haptic preference, daily records, reset confirmation and reduced-motion handling without migrations or additional permissions.

## 0.12.0 — a quieter Tasbih page

- Replaced the oval bead loop with a curved horizontal onyx-style strand, textured native gradients, a larger centered count and slim round progress.
- Added one-count sideways gestures while retaining tap/downward counting, haptics and reduced-motion support. Gesture release suppresses a duplicate press.
- Grouped count/undo/reset controls and a full-text remembrance picker; moved vibration and preset/custom round targets into the existing draggable settings sheet.
- Retained per-remembrance counters, daily totals, reset confirmation, source actions/storage IDs, bilingual themes and Font Awesome Light icons.

## 0.11.2 — silent fullscreen intro

- Limited the supplied startup video to its first nine seconds without re-encoding frames; removed its audio stream.
- Removed Skip and sound controls; the video fills the screen with proportional cropping and returns to the intended route automatically.
- Hide Android status/navigation bars only during the intro and restore their previous visibility/behavior afterward, including repeated resume calls.

## 0.11.1 — larger day/night artwork

- Enlarged launcher and audio-notification artwork by approximately 34% through native rendering; retained original source images.

## 0.11.0 — timed branding and startup video

- Added sunrise-to-Isha morning and Isha-to-sunrise evening branding using the selected city's ESA cache, stable launcher aliases and native artwork refresh.
- Replaced the startup spinner with the supplied 15-second video, muted by default with sound toggle, Skip, error timeout and background pause.
- Added bounded ESA refresh and native boundary scheduling without GPS or a new permission prompt. Actual release evidence is recorded separately.

## 0.10.0 — connected daily journey

- Added a personalized Home with ESA next-prayer countdown, saved reading/remembrance, chosen daily companions, optional city/reminder setup, a separate Explore grid and Settings route.
- Added date-aware 7/30-day reports and an activity calendar without inventing historical reading dates.
- Moved Quran recitation above navigation, using original KSU ayah queues, native background/notification controls, repeat and a bounded sleep timer. Added an ESA-cache-only Android home-screen widget.
- Added optional PKCE email accounts, secure native session storage, isolated guest/account caches, explicit guest import, durable private sync, revision conflicts, recoverable copies and scoped cloud deletion. Hosted authorization tests use rolled-back synthetic identities; local XP remains separate from trusted server XP.
- Removed exactly the final 57 seconds of Isha Adhan, retaining its earlier 5.6-second beginning trim; versioned browser audio URLs prevent stale previews.
- Added ZAD small/large notification artwork and source-built native media-session updates for loaded per-ayah duration and ayah number/total, including while JavaScript is suspended.
- Updated compatible Expo patch packages and blocked unused biometric permissions. Actual release/device gates are recorded separately; public SMTP/signing/source-permission gates remain open.

## 0.9.0 — personal XP, levels and achievements

- Added an offline participation ledger with a 100 XP daily cap, per-category limits, stable source identities, reversible allocations and zero retroactive rewards on migration. Local totals remain separate from trusted server XP.
- Added progressive levels and twelve derived badges with saved source events, deterministic eligibility dates and correction-aware progress.
- Added My achievements from Home and More, Arabic/English light/dark layouts, badge filters, daily XP, next-level progress, recent participation and transparent rules. Existing backups retain all previous records.

## 0.8.0 — personal remembrance and good deeds

- Kept reminder disabling immediate when an unsaved time draft is invalid; enabling and saving still validate the chosen times.

- Added optional personal Good Deeds choices, custom archived titles, reversible daily check-ins, weekly records and three editable opt-in reminder times. Notification bodies use generic encouragement without private deed titles.

- Added six offline Adhkar sections from the user-selected Risala edition with complete included texts, source notes/citations, bounded repetition counters, favorites, text size and saved reading position. Morning/evening variants, prayer-specific entries and shared daily counts retain their source context.

- Added a bead-loop Tasbih page beside Quran in bottom navigation, tap/downward-pull counting, optional haptics, independent phrase counters, personal goals, undo and confirmed reset. New devotional records migrate into existing private storage and backups.

## 0.7.0 — prayer notification sound controls

- Added explicit ten-minute prayer reminder titles, a native countdown and a one-prayer mute/undo action. Muting skips that prayer's intro and Adhan while keeping subsequent prayers unchanged.
- Added mute/unmute beside notification stop during playback and a matching native Adhan-screen control. Mute persists across intro/Adhan, leaves phone alarm volume unchanged and clears for the next session.
- Scoped immutable notification actions to prayer identities/playback sessions; persisted one-prayer mutes and rejected expired or stale controls. Added four native policy tests and a real-device notification-control harness flow.

- Built, signature/source/font/audio verified, installed and cold-launched the private 0.7.0 arm64 APK over 0.6.1 on Android 16; retained permissions and existing prepared recordings.

## 0.6.1 — Isha recording start

- Removed exactly the first 5.6 seconds from the separate Tobar Isha Adhan; retained the Isha intro and all eleven other recording files byte-for-byte. Updated the pinned hash, size and duration for offline extraction and preview.
- Recorded the user-confirmed 0.6.0 Friday locked-screen notification, intro and Al-Azhar playback separately from patch verification.

## 0.6.0 — prayer-specific voices and Friday audio

- Added a hash-pinned twelve-clip catalogue: five ordinary MBC intros, one Friday intro and six Adhan recordings, with separate Tobar Fajr/Isha sources.
- Assigned Tobar to Fajr/Isha, Shuaisha to ordinary Dhuhr, Husary to Asr, Rifaat to Maghrib, and the user-selected Al-Azhar recording to Friday Dhuhr only, using the saved Cairo calendar date.

- Added sequential native playback and per-prayer previews, with matching private bundled recordings, all-file hash checks, one stop action and a duration bound that accommodates the longer Tobar recordings.
- Fixed rapid stop/start lifecycle races and cleared pending audio after stopping an intro. All six native sequences and intro-stop were exercised on Android 16.
- Replaced the single audio relay with a validated local clip selector; malformed/extra/duplicate selectors fail closed.
- Built the private 0.6.0 arm64 APK, verified 107 runtime inputs/seven compiled sources/twelve exact recording hashes and installed it over 0.5.0 on Android 16. Versioned release records preserve the previous 0.5 evidence and distinguish final-product acceptance from isolated hardware tests.

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
