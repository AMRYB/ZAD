# Corrected delivery plan and evidence status

## Source and identifiers

Product requirements are maintained under `docs/source-plan/`.

Use `EPIC-01` ... `EPIC-28` for product areas, and `RJ-001` ... for implementation tickets. Never reuse an epic number as a ticket identifier. This resolves the original `RJ-03`/`RJ-003` collision. Phases are named Phase A/B/C rather than confusing priority P0/P1 with phase numbers.

## First preview: local complete flows

Scope: foundation/CI, design/locale, onboarding, local daily tracking and habits, seasonal calendar, dashboard, goals, independent reading plans, KSU reader, settings/privacy and repository source credits, Android preview build and its release checks. Social/Auth/AI are not fake placeholders in this preview.

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

## Reader revision 0.2

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-013 | KSU Hafs reciter catalogue and Arabic tafsir allowlist | 41 observed recordings, 5 authors; 4 bounded audio samples 206, 4 new tafsir samples 200 |
| RJ-014 | Persist selected reciter/author/display mode | Restore/migration tests PASS; reciter/author persistence verified in browser |
| RJ-015 | Complete-page geometry and immersive presentation | Geometry tests and portrait/landscape browser containment PASS; native QA pending |
| RJ-016 | Compact reader controls and selection sheets | Implemented; typecheck/lint and browser interaction/visual checks PASS |
| RJ-017 | Reader browser QA and updated APK | Web export and local arm64 build PASS; manifest/signature/source comparison PASS; Android installation pending |
| RJ-018 | Repository-only source attribution in both UI languages | User-requested UI copy verified; documentation and original KSU integration retained |

## Phase B: cloud release

Database core migration and PostgreSQL security tests are implemented. Live Auth, private per-account sync/outbox/conflict resolution, achievements, challenges, social UI, moderation and seasonal boards remain planned. No hosted credentials/project were available. SQL tests do not promote these whole epics to TESTED.

## Later content and optional features

Reviewed adhkar/dua and lessons require source/editorial decisions. Prayer times require a chosen calculation authority and comparison fixtures. Notifications require device timing tests. Charity, Family and optional AI remain separate later-phase work. They are not beta promises.

## Release rule

An APK file, reproducible build, actual installation and real Android smoke results are separate gates. A successful browser test never counts as Android installation. Public KSU usage approval and unresolved dependency advisories are release review items. No Google Play upload or public deployment is authorized by a local preview build.

## Gesture revision 0.3

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-019 | Focal pinch zoom, bounded pan, swipe intent and boundary rules | Five gesture regression tests PASS; 28 total tests PASS |
| RJ-020 | Direct-touch canvas and stacked player/navigation cards | Browser next/previous swipes, zoomed pan, ayah taps and repeated upward card cycling PASS; native multitouch pending |
| RJ-021 | Updated Android preview and delivery evidence | Local build, signature, manifest and 44-file source comparison PASS; native installation/two-finger interaction pending |

## ZAD naming and repository delivery

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-022 | ZAD branding with storage identity compatibility | Source 0.3.1; typecheck/lint and 28 tests PASS; renamed APK not built |

## Reader polish 0.4

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-023 | Font Awesome 7.3.1 shared icon component and local Pro Light configuration | Typecheck/lint and 30 tests PASS; paid font excluded from public repository |
| RJ-024 | Sideways card stack, grab-line removal and transition input guard | Gesture regression and browser lateral/short/vertical/rapid-cycle checks PASS |
| RJ-025 | Centered immersive controls, safe-area separation and restored surah dropdown | Browser portrait/landscape and 200% zoom checks PASS; arm64 build/signature/font/source verification PASS; actual Android installation pending |
| RJ-026 | ZAD 0.4.0 Android artifact and delivery evidence | Build PASS in 11m 19s; signature/manifest/embedded Light font and 64 runtime files match; native install pending |

## Reader sheets 0.4.1

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-027 | Split immersive ayah/actions card without page arrows | Browser RTL geometry, ayah selection and 360/390 portrait plus landscape PASS |
| RJ-028 | Finger-controlled sheet height and downward dismissal | Browser surah/reciter resizing, dismissal and list scroll PASS; three new gesture-policy tests PASS |
| RJ-029 | Updated private APK and verification evidence | Build, signature, manifest, Light font, 66 runtime files and compiled reader sources PASS; native device testing pending |

## Reader and Adhan 0.5

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-030 | Equal-sided immersive controls and arrow-free navigation card | Browser 390px geometry PASS: card and play centers both 195.2px; ayah on physical right, text-only tafsir on left; navigation chips have no page arrows. Typecheck/lint PASS; 39 existing/new TS tests PASS |
| RJ-031 | Official ESA request contract, monthly parser and city catalogue | Live GET/POST and web relay PASS; 82 captured options and complete October table fixtures; 40 TS tests PASS including wrong city/year, DST, deduplication and backup migration |
| RJ-032 | Native exact prayer alarms, private offline audio and stoppable foreground playback | Six native parser tests PASS; isolated real Android 16 tests PASS for source requests, reminders, screen-off playback service, notification stop and cancellation; cold-process restart and audibility confirmed separately |
| RJ-033 | More → Adhan city/day/settings UI and sound-volume warning | Browser Arabic/English, light/dark, today/tomorrow/date and city changes PASS; typecheck/lint PASS; final product APK installation recorded separately |
