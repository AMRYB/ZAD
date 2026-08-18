# Verification report

## Connected journey 0.10.0 — current

Current evidence: 81 TypeScript tests, 22 native unit tests, 5 isolated hardware checks, typecheck/clean lint, Doctor 20/20 and production web export PASS. Final APK/source/signature/asset/media-patch checks and Android 16 update PASS. User confirmed private sign-in/import/sync with retained records, widget/Isha cutoff and final repaired recitation/notification appearance. The media startup regression was repaired before final acceptance. Details and limits: ANDROID_APK_RELEASE.md, BUILD_METADATA.json and JOURNEY_V0_10.md. Historical sections below describe their original versions.

## Personal gamification 0.9.0

Typecheck/lint and all 66 TypeScript tests PASS, including twelve new XP/level/badge tests and a thirty-day all-badge journey. Twenty native parser/policy tests were rerun and passed. Browser Home/More navigation, participation → 5 XP + First step, reload persistence, undo/relock, redo without duplication, filtering/rules and Arabic/light + English/dark layouts passed. At 320px/390px, measured horizontal overflow was zero; observed console error logs were empty. QA check-ins were undone and original appearance restored.

Android build PASS in 10m 30s. Signature/manifest, 129 input comparisons, 23 compiled sources, exact Light font, twelve recordings, native receivers/haptics/R8 helpers and harness exclusion PASS. After reconnecting the phone, install -r over 0.8.0 PASS on Android 16. The installed app reports 0.9.0/code 12, cold-launched into the achievements intent, remained top-resumed/alive and emitted no own-process AndroidRuntime/ReactNativeJS errors. Notification, exact-alarm and vibration access remain granted. The user confirmed that XP and a badge appeared and previous data remained present on the phone. Full source/limitations: `GAMIFICATION_V0_9.md`. The existing 0.8.0 Doctor/audit advisories were not rerun because dependencies are unchanged.

## Executed automated checks

| Check | Actual result | Scope |
|---|---|---|
| TypeScript `npm run typecheck` | PASS | Strict application types, API routes and tests |
| ESLint `npm run lint` | PASS | Expo/React rules |
| `npm test` | PASS, 66 tests | Domain behavior, KSU geometry, relay allowlist, SQLite reopen, PostgreSQL authorization, ESA source/date/DST and Adhan migration |
| Native release parser/policy tests | PASS, 20 tests | Captured ESA table, Cairo DST, Friday-only audio, reminder timing/identity/expiry |
| `npx expo-doctor` | 19/20, patch-version advisory | Five newer SDK 58 patch packages are recommended; not counted as a pass. See ADHAN_VERIFICATION.md |
| `npm run build:web` | PASS | Production web bundles and all three fixed-source API routes exported |

Baseline 0.8.0: 54 TypeScript + 20 native tests, typecheck/lint and web export passed. Browser tests cover animated Tasbih tap/pull/undo/reload, source-pinned full Adhkar text/citations/counts/favorites/last position, and Good Deeds selection/custom/check-in/undo/archive/reload. Arabic/light and English/dark, 390px and 320px, and the KSU surah reading link passed. Actual isolated Android personal reminders passed for both groups, restoration planning, duplicates, English labels, disable and stale delivery. The signed private product APK matches 124 inputs, 18 compiled sources, font and all twelve audio files. It was installed over 0.7.0 and refreshed after the final reminder-draft fix on Android 16, retaining permissions/data. The user confirmed actual counting, vibration and vibration-off on the unchanged Tasbih implementation. No own-process runtime errors were observed. Expo Doctor is 19/20; five existing high audit findings in the Expo/CLI signing chain remain documented in `DEVOTIONAL_V0_8.md`. Long-term Doze/reboot/clock and full TalkBack coverage are not inferred from these tests.

The archived 0.6.0 APK build/signature, 107 source/config/asset comparisons, seven compiled JavaScript sources and all twelve packaged audio hashes passed. The APK was installed over 0.5.0 and launched successfully on Android 16, retaining notification and exact-alarm permissions. Six native audio sequences, stopping a queued Adhan during its intro, and a separate exact-alarm regression were tested through an isolated harness. That isolated alarm run had the screen on. The user subsequently confirmed the installed 0.6.0 product's Friday reminder, intro and Al-Azhar Adhan with the screen locked; evidence is archived in `ANDROID_APK_RELEASE_v0.6.0.md`. The 0.5 evidence is archived separately.

Version 0.6.1: exactly 5.6 seconds were removed from the Isha Adhan, verified against the original decoded tail; all eleven other recordings remain byte-identical. Typecheck/lint, 44 TypeScript and 11 native tests passed again. The Isha and intro web responses match their hashes. APK build/signature, 107 inputs, seven compiled sources, twelve audio hashes and update/launch over 0.6.0 on Android 16 passed. Permissions remained granted, with no own-process runtime errors observed. New listening/locked-screen tests, production web export and Expo Doctor were not repeated for this media-only patch. See the current release record.

Version 0.7.0: typecheck/lint, 44 TypeScript and 15 native tests passed. The production web export passed with all three API routes. Actual reminder/playback notification PendingIntents passed through the isolated Android 16 APK: ten-minute spacing/countdown, per-prayer mute/undo, scheduled silent arrival, next-prayer playback, mute across intro completion, unmute/stop and stale-session rejection. System alarm-volume value was unchanged; `screenOff=true` was sampled at the end. This is not an external acoustic measurement. The final product's 109 inputs, seven compiled sources, font, twelve recording hashes, signature, update over 0.6.1 and cold startup passed. Notification/exact-alarm permissions remained granted and no own-process runtime errors were observed. New final-product user acceptance was not repeated. See `ADHAN_NOTIFICATIONS_V0_7.md` and the current release record.

The PostgreSQL test executes the migration on PGlite with a test-only Supabase Auth shim. It checks own-user RLS, forbidden direct writes, stale revision rejection, award idempotency and daily cap, consented leaderboard projection, and deletion cascade. It does not test a deployed Supabase instance.

SQLite tests execute the application's migration/upsert SQL against a real file, close and reopen it, and validate the restored snapshot. Native Expo bridge verification is a separate device gate.

## Actual browser checks — 0.1 baseline

The application was exercised at localhost using a 390 × 844 viewport. Records used for these checks were synthetic. Browser localStorage is separate from Android SQLite.

- Arabic default onboarding; English and appearance selection survive a reload.
- Prayer and fasting edits, a private synthetic note and goal counter survive reload; dashboard/progress reflect actual records.
- Two independent reading plans, Arabic-digit input, duplicate-page deduplication, undo, and persistence after reload.
- Habit completion belongs to its date; previous-day navigation does not copy completion; undo works.
- JSON export creates an actual download. Selecting that file opens a restore confirmation; confirming restores validated data.
- Restoring the exported English/dark snapshot from an Arabic/light UI restores both checked settings and reinitializes the active screen.
- A manually configured 29-day synthetic season produces 29 calendar entries. Opening the first entry sets the daily editor to `2026-10-01`. This is a QA fixture, not an asserted Ramadan date.
- English dark and Arabic light layouts, selected-state ARIA attributes, reversed Arabic tab positions, and no horizontal overflow at the tested width.
- KSU page 1: 14 selectable rectangles; selected 1:4; original Saadi text loads. Audio advanced from 1:4 to 1:5 and stopped through its control.
- KSU page 3: 26 rectangles; selecting a multiline 2:9 rectangle selects ayah 9.
- KSU page 604: 22 rectangles spanning surahs 112–114; selected 114:6; saved bookmark; next-page control disabled.
- Additional bounded live checks: page 301 (Al-Kahf 18:62, 28 rectangles), page 50 (Aal-Imran 3:1, 20 rectangles), and page 4 (Al-Baqara 2:17, 21 rectangles). Each original KSU PNG loaded with nonzero natural dimensions and its hilites produced selectable overlays. These checks verify loading/navigation; they are not pixel-by-pixel audits of every verse on those pages.
- An actual same-origin relay GET returned the original KSU JSON. The original `interface.php` response lacked a CORS allow-origin header; Android uses the original URL directly.
- Two actual local HTTP requests attempting an arbitrary destination and page `9999` both returned `400 Invalid KSU request`; rejected requests are not forwarded to KSU.

Screenshots in `screenshots/` are captured running UI, not concept designs. Earlier KSU browser/CDP captures and response samples are retained in `KSU_API_DOCUMENTATION.md` and `ksu-evidence/`. The 52 reference rectangles cover pages 1, 2 and 3; they are not a claim that all 604 pages were manually checked.

## Issues found and repaired

- A Fast Refresh context identity failure: the context/hook now lives in a module independent of the provider component.
- Back navigation from a directly loaded or refreshed plan/calendar had no prior stack: explicit progress/settings fallbacks were added.
- The directly loaded plan route was retested: its back control opened `/progress` successfully.
- Backup restoration must discard open form/reader drafts: a restore epoch remounts the screen navigator after validated replacement.
- Web radio/tab/progress state needed explicit ARIA properties alongside native accessibility properties.
- Arabic bidirectional text reversed visual numeric ratios: statistics and playback counters now explicitly use LTR number direction. The browser reported the expected `0 / 5` text with `direction: ltr`; the Arabic screenshot was recaptured and the final fresh page had no captured console errors.

## Android evidence and remaining release gates

See `ANDROID_BUILD.md` for the actual build command and `ANDROID_APK_RELEASE.md` for artifact/device status. Browser success does not count as an installed Android smoke test. Device font scaling, TalkBack, rotation, native audio interruptions and force-stop/reopen persistence require Android verification.

Hosted Auth, cloud sync, challenge/social UI, reviewed lesson/adhkar content, Family and AI remain unimplemented. Prayer times and Adhan-specific notifications are implemented in 0.5.0 using ESA; general reminder campaigns remain separate. The source plan and future requirements remain preserved. Dependency advisory and KSU distribution reviews remain open in `../THIRD_PARTY_NOTICES.md`.

## Revision 0.2 checks

Typecheck/lint and 23 tests PASS, including provider validation, backup migration and complete-page geometry. Production web export PASS. Four additional tafsir HTTP samples returned 200, four bounded reciter ranges returned 206, and the local relay accepted Ibn Kathir/Al-Baghawi while rejecting an unknown author with 400. See `READER_V0_2_DESIGN.md`.

The stale error tab was left alone after the browser safety gate rejected its internal protocol. The development server was found to bind only IPv6 localhost; restarting it with process-local `NODE_OPTIONS=--dns-result-order=ipv4first` restored IPv4 loopback access. The user opened a valid HTTP tab and confirmed that the Mushaf appeared. The checks below used that valid tab, without a browser-policy workaround.

Actual revision checks at 390 × 844:

- Chose Mishary Al-Afasy through reciter search; reloaded and confirmed the choice persisted.
- Changed Al-Saadi to Ibn Kathir inside the tafsir sheet. Actual Ibn Kathir text loaded for 2:17 and 1:5; the chosen author survived reload.
- Selected Al-Faatiha and ayah 4. Al-Afasy playback advanced automatically from 1:4 to 1:5, moved the highlight, and displayed `0:01 / 0:06` with progressing playback. Pause stopped at `0:05 / 0:06`. This is browser audio behavior, not a native interruption test.
- Complete-page and immersive modes displayed the original page with its frame. Immersive mode removed all five application tabs; document dimensions remained 390 × 844 with no page overflow.
- Zoom changed the image plane from 374 to 561 CSS pixels (150%). Tapping the 1:4 overlay selected that ayah; reset returned to complete-page mode.
- Fill-width selected-state persisted after reload alongside Al-Afasy and Ibn Kathir; reset returned to complete-page.
- English/dark reader labels, player and full page were visually reviewed. Arabic/light was restored afterward.
- At 844 × 390 in immersive mode, the original page fit the 252.5 px tall stage (253 px rendered plane after fractional layout rounding), with no document overflow. This is responsive browser geometry, not Android rotation.
- Per the user's subsequent request, removed provider-brand text and source-link controls from onboarding, settings, reciter/tafsir sheets, reading tools and error messages in both languages. Actual Arabic/English settings and the Arabic reader/reciter sheet contained no KSU/King Saud University label. Attribution, HTTP evidence and the exclusive KSU implementation remain in repository documentation.

New captures: `reader-v0.2-ar.png`, `reciter-picker-v0.2-ar.png`, `tafsir-ibnkathir-v0.2-ar.png`, `immersive-v0.2-ar.png`, `reader-v0.2-en-dark.png`, and `immersive-v0.2-landscape.png` in `screenshots/`. The captured browser log contained the expected Metro-disconnect warning during the explicit development-server restart; no application error was captured in the final log review. The viewport override was reset after checks. No installation on Android has been performed. See `ANDROID_APK_RELEASE.md` for verified file/build status.


## Revision 0.3 checks

See `READER_GESTURES_V0_3.md` for the exact interaction evidence and repaired short-handle responder issue. Current typecheck/lint, 28 tests, Expo Doctor 20/20 and production web export PASS. Actual browser checks cover forward/backward page dragging, the first-page boundary, 150% bounded panning without navigation, ayah selection, repeated upward card cycling, the final text-only surah label and larger page picker. Audio advanced while navigation was in front and paused on route exit.

Two-finger pinch was tested as deterministic gesture-controller input, not as injected browser multitouch or physical Android input. Native installation/multitouch remains unverified. The v0.3 screenshots represent this version, whereas v0.2 screenshots remain versioned baseline evidence.


## ZAD source rename and repository import

Current source is 0.3.1, branded ZAD / زاد. The Android package, deep-link scheme, SQLite filename and web storage key were retained. Typecheck/lint and all 28 tests passed after the branding edits and legacy import; the ZAD production web export also passed. No new Android binary or installed-device result is claimed for the rename. The existing 0.3 APK metadata continues to identify its original compiled commit.


## Timed branding and startup video 0.11

82 TypeScript tests, typecheck/clean lint, 26 native tests, Doctor 20/20 and final production web export PASS. The isolated Android 16 harness cycles day/night/day with one launcher entry and no process kill; enlarged launcher/notification pixels and five timer/widget/artwork regressions PASS. Harness removed afterward. Browser observation verifies video playback, sound toggle, automatic completion and Skip; temporary 390x844 viewport reset. Owner confirmed initial icons/notification/video/Skip and the final enlarged size on Android. Physical overnight transitions, API24/25/alternate-launcher rendering remain unverified; final 0.11.1 artifact/install/acceptance are recorded in ANDROID_APK_RELEASE.md.


## Silent fullscreen intro 0.11.2

82 TypeScript tests, typecheck/clean lint and final production web export PASS. FFprobe confirms exactly 9.000 seconds, H264 1080x1920, 270 frames and no audio stream. Every decoded frame matches the original first nine seconds, with no re-encoding. Browser observation confirms duration 9, muted playback, cover layout across 390x844, zero intro buttons and automatic transition to Home. Actual screenshot remains private in .test-output/intro9-fullscreen.png. Native hide/restore after repeated entry PASS on the unlocked Android 16 phone. Final APK verification/install PASS; owner confirmed fullscreen/no controls, nine-second transition and normal system bars. See release metadata.

## Tasbih visual revision 0.12

Typecheck, clean lint and 82 tests PASS. Browser bead/button taps, one-count sideways/downward drags, undo restoration, reset-cancel, independent phrase counts, Arabic-digit custom target/invalid-zero handling and vibration preference toggles PASS. Arabic Light 390x844 / English Dark 320x720 and long text checked without horizontal document overflow. Initial preferences and tested counts were restored. A fresh preview reload removed a stale Metro-module error; no fresh console errors observed. Native artifact/install PASS; the owner confirmed layout/counting, physical vibration and retained prior records. See ANDROID_APK_RELEASE.md.
