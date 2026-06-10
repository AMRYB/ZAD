# Corrected delivery plan and evidence status

## Source and identifiers

The supplied ten-file planning archive is preserved unchanged under `docs/source-plan/`. It is a requirements reference, not proof of prior implementation. The earlier prototype named there was absent. The current repository was created during this implementation.

Use `EPIC-01` ... `EPIC-28` for product areas, and `RJ-001` ... for implementation tickets. Never reuse an epic number as a ticket identifier. This resolves the original `RJ-03`/`RJ-003` collision. Phases are named Phase A/B/C rather than confusing priority P0/P1 with phase numbers.

## First preview: local complete flows

Scope: foundation/CI, design/locale, onboarding, local daily tracking and habits, seasonal calendar, dashboard, goals, independent reading plans, KSU reader, settings/privacy/source credits, Android preview build and its release checks. Social/Auth/AI are not fake placeholders in this preview.

| Ticket | Delivered slice | Evidence state |
|---|---|---|
| RJ-001 | Expo 58 / TypeScript / Router / pinned lockfile | Installed; typecheck/lint; Expo Doctor 20/20 |
| RJ-002 | Source-plan and KSU evidence import | Imported; prior app prototype absent |
| RJ-003 | Cairo and locked light/dark themes | Browser visual checks; native QA pending |
| RJ-004 | Arabic default and persistent English | Browser fresh start/reload verified |
| RJ-005 | Direction-aware UI, tabs, a11y state | Browser responsive/directional checks; TalkBack pending |
| RJ-006 | Onboarding and reconciled dashboard | Browser interactions and local persistence |
| RJ-007 | Calendar/timezones/29–30-day mapping | Unit tests; 29-day browser grid verified |
| RJ-008 | SQLite, daily records, notes and habits | Restore/reducer tests, SQLite reopen test, browser persistence |
| RJ-009 | Goals, multiple reading plans, catch-up | Unit tests and browser flow checks |
| RJ-010 | KSU reader, geometry, audio, tafsir/bookmarks | 52 reference rectangles + live web flow; native QA pending |
| RJ-011 | APK build and device release gate | See QA_REPORT; no installed-device claim without evidence |

## Phase B: cloud release

## Reader revision 0.2

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-012 | Actual Git delivery log | Existing history published; no synthetic dates/counts |
| RJ-013 | KSU Hafs reciter catalogue and Arabic tafsir allowlist | 41 observed recordings, 5 authors; 4 bounded audio samples 206, 4 new tafsir samples 200 |
| RJ-014 | Persist selected reciter/author/display mode | In progress |
| RJ-015 | Complete-page geometry and immersive presentation | Planned for this revision |
| RJ-016 | Compact reader controls and selection sheets | Planned for this revision |
| RJ-017 | Reader browser QA and updated APK | Planned for this revision |

## Phase B: cloud release

Database core migration and PostgreSQL security tests are implemented. Live Auth, private per-account sync/outbox/conflict resolution, achievements, challenges, social UI, moderation and seasonal boards remain planned. No hosted credentials/project were available. SQL tests do not promote these whole epics to TESTED.

## Later content and optional features

Reviewed adhkar/dua and lessons require source/editorial decisions. Prayer times require a chosen calculation authority and comparison fixtures. Notifications require device timing tests. Charity, Family and optional AI remain separate later-phase work. They are not beta promises.

## Release rule

An APK file, reproducible build, actual installation and real Android smoke results are separate gates. A successful browser test never counts as Android installation. Public KSU usage approval and unresolved dependency advisories are release review items. No Google Play upload or public deployment is authorized by a local preview build.
