# Verification report

## Executed automated checks

| Check | Actual result | Scope |
|---|---|---|
| TypeScript `npm run typecheck` | PASS | Strict application types, API routes and tests |
| ESLint `npm run lint` | PASS | Expo/React rules |
| `npm test` | PASS, 40 tests | Domain behavior, KSU geometry, relay allowlist, SQLite reopen, PostgreSQL authorization, ESA source/date/DST and Adhan migration |
| Native release parser tests | PASS, 6 tests | Captured ESA table, dates, wall-clock parsing and Cairo DST |
| `npx expo-doctor` | 19/20, patch-version advisory | Five newer SDK 58 patch packages are recommended; not counted as a pass. See ADHAN_VERIFICATION.md |
| `npm run build:web` | PASS | Production web bundles and all three fixed-source API routes exported |

The current 0.5.0 Android release build, signature and 91 source/config/asset comparisons passed. The product APK was installed over 0.4.1 and cold-launched on a real Android 16 phone. The user completed city/permission setup and confirmed the final product's test notification and audible Adhan with the screen locked. Background Adhan, notification stop/cancellation and cold-process playback were also tested through a disposable harness compiling production Kotlin sources. See `ADHAN_VERIFICATION.md` and `ANDROID_APK_RELEASE.md` for exact scenario boundaries and remaining gates.

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
