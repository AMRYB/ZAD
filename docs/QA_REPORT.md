# Verification record — 23 October 2026

## Executed automated checks

| Check | Actual result | Scope |
|---|---|---|
| TypeScript `npm run typecheck` | PASS | Strict application types, API routes and tests |
| ESLint `npm run lint` | PASS | Expo/React rules |
| `npm test` | PASS, 17 tests | Domain behavior, captured KSU geometry, relay allowlist, SQLite reopen, PostgreSQL authorization |
| `npx expo-doctor` | PASS, 20/20 | SDK dependencies and application configuration |
| `npm run build:web` | PASS | Production web bundles and the allowlisted API route exported |

The PostgreSQL test executes the migration on PGlite with a test-only Supabase Auth shim. It checks own-user RLS, forbidden direct writes, stale revision rejection, award idempotency and daily cap, consented leaderboard projection, and deletion cascade. It does not test a deployed Supabase instance.

SQLite tests execute the application's migration/upsert SQL against a real file, close and reopen it, and validate the restored snapshot. Native Expo bridge verification is a separate device gate.

## Actual browser checks

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

No hosted Auth, cloud sync, challenge/social UI, prayer-time authority, notifications, reviewed lesson/adhkar corpus, Family or AI flow has been declared complete. The source plan and future requirements remain preserved. Dependency advisory and KSU distribution reviews remain open in `../THIRD_PARTY_NOTICES.md`.
