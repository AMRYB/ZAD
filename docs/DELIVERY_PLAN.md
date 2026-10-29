# Corrected delivery plan and evidence status

## Offline content and playback continuity0.13.0

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-063 | Explicit KSU offline downloader, persisted private content and reader integration | Ten domain tests plus small live eight-file267.7KB sample, reload/reopen and cached reader integration PASS; complete downloads and native offline device test NOT RUN |
| RJ-064 | Supplied post-Adhan dua and non-destructive focus handling | Thirteen exact recording hashes, all prayer/Friday triple queues, four focus policy tests PASS;30 native tests total. Phone notification interruption and full audible sequence NOT RUN |
| RJ-065 | Independent direct Tasbih pull capture and footer removal | Two domain tests and actual left/right/down/short browser drags PASS; original counter restored. Native touch check NOT RUN |
| RJ-066 | Private0.13.0 artifact and release record | Build/signature/configuration,212 input comparisons/57 compiled sources,13 recordings and retained media/branding assets PASS. No connected phone; installation smoke NOT RUN |

## Emerald beads and collision sound0.12.2

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-062 | Green beads, contact-timed original effect and independent persisted mute | Typecheck/lint/83 TS tests,26 native tests, web export and APK input/compiled-source/signature/WAV/native-helper checks PASS. Browser count/undo and mute persistence with unchanged haptics/retained count PASS. Physical installation, audibility and concurrency NOT RUN; owner chose APK testing later |

## Tasbih reference correction 0.12.1

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-061 | Open-centre bead transfer, visible upward arch and responsive vertical distribution | Implemented; typecheck/lint/82 TS tests and production web export PASS. Final Arabic/English light/dark mobile browser interaction/layout checks, 26 native tests, build/signature/196 inputs/48 compiled-source checks PASS; owner chose APK testing later, so installation and physical-device acceptance remain pending |

## Tasbih visual revision 0.12

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-060 | Reference-inspired horizontal bead strand and focused counter | Implemented; actual browser tap/side/down count, undo, reset cancel, phrase isolation and target/haptic settings PASS. Typecheck/lint/82 TS tests and APK verification/install PASS; owner confirmed layout/counting/vibration and retained data |

## Silent fullscreen intro 0.11.2

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-059 | Original first nine seconds, no audio/controls, cover rendering and scoped Android immersion | Exact frame/audio checks, typecheck/lint/82 TS tests, browser/Android immersion, APK verification/install PASS; owner confirmed final behavior |

## Timed branding and intro 0.11

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-056 | ESA sunrise/Isha launcher and notification artwork | Policy and isolated Android16 alias cycle PASS; owner accepted 0.11.0 appearance |
| RJ-057 | Supplied video with Skip, sound and safe route transition | Browser controls/completion PASS; owner confirmed video/Skip on Android0.11.0 |
| RJ-058 | Enlarge day/night artwork after owner feedback | Native pixel checks, 82 TS tests/typecheck/lint, final APK verification/install PASS; owner confirmed final size |

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
| RJ-007 | Calendar/timezones/29Ã¢â‚¬â€œ30-day mapping | Unit tests; 29-day browser grid verified |
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

Reviewed adhkar/dua and lessons require source/editorial decisions. Prayer times and Adhan-specific notifications were added in 0.5 using the user-selected ESA authority, captured fixtures and real-device timing checks below. General reminder campaigns, Charity, Family and optional AI remain separate later-phase work. They are not beta promises.

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
| RJ-033 | More Ã¢â€ â€™ Adhan city/day/settings UI and sound-volume warning | Browser Arabic/English, light/dark, today/tomorrow/date and city changes PASS; typecheck/lint PASS; final product APK installation recorded separately |
| RJ-034 | ZAD 0.5.0 APK, actual installation and final product alarm test | Build/signature/91 source files/six compiled sources/font PASS; update over 0.4.1 and cold launch PASS; user completed permissions/scheduling and confirmed notification plus audible Adhan with screen locked. 40 TS + 6 native tests PASS; Expo Doctor 19/20 patch advisory retained |

## Prayer-specific audio 0.6

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-035 | Fixed per-prayer/Friday audio catalogue and Cairo-date selection | Twelve source/hash/duration records; 44 TypeScript tests and 11 native parser/sequence tests PASS; exact user-selected intro/Friday IDs retained |
| RJ-036 | Native intro/Adhan queue, private assets and per-prayer preview UI | Android 16: six sequences/all twelve files and intro-stop PASS; rapid stop/start race repaired; twelve HTTP hash checks and Arabic/English light/dark browser checks PASS |
| RJ-037 | ZAD 0.6.0 private APK and release verification | Build/signature/107 source files/seven compiled sources/font/twelve audio hashes PASS; installed over 0.5.0 and launched on Android 16; permissions retained. 44 TypeScript + 11 native tests PASS. Final product Friday locked-screen confirmation tracked in release metadata |

## Isha recording correction 0.6.1

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-038 | Remove first 5.6 seconds of Isha Adhan only and deliver patch APK | Exact sample trim/waveform check and eleven unchanged files PASS; typecheck/lint, 44 TypeScript + 11 native tests PASS; build/signature/107 inputs/seven compiled sources/twelve audio hashes PASS; installed over 0.6.0 and launched on Android 16 with permissions retained. New listening/locked-screen test not repeated |

## Prayer notification controls 0.7

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-039 | Ten-minute countdown, per-prayer reminder mute/undo and live notification mute/unmute | Typecheck/lint, 44 TypeScript + 15 native tests PASS. Isolated Android 16 real actions, muted scheduled alarm, next-prayer playback, intro-to-Adhan mute, undo/stop and stale-session isolation PASS; phone volume unchanged |
| RJ-040 | ZAD 0.7.0 private APK and release verification | Build/signature/109 inputs/seven compiled sources/font/twelve audio hashes/actions PASS; installed over 0.6.1 and cold-launched on Android 16, permissions retained. New final-product user acceptance not repeated |

## Devotional pages 0.8

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-041 | Animated Tasbih and persisted devotional foundation | Implemented bead loop, tap/pull, reduced-motion support, haptics toggle, independent counters and backup migration; typecheck/lint and 49 TypeScript tests PASS. Final browser/device checks follow after integration |
| RJ-042 | Source-pinned Adhkar reader and optional reminder foundation | 90 unique entries in six sections, favorites, full text/citations, per-prayer progress and last position; 54 TypeScript + 20 native tests PASS. Isolated Android personal reminders passed; source/limits documented in DEVOTIONAL_V0_8.md |
| RJ-043 | Personal Good Deeds choices and daily records | Eight suggestions plus private custom choices, selection, check-in/undo, archive preservation and reload persistence PASS; bilingual/dark/mobile browser checks and source tests PASS |
| RJ-044 | ZAD 0.8.0 private APK and final device verification | Build/signature/124 inputs/18 compiled sources/font/audio/haptics/personal receiver PASS; actual Android 16 update/startup PASS; user confirmed native counting, vibration and off-toggle. 54 TypeScript + 20 native tests PASS; Doctor 19/20 and existing audit findings documented |

## Personal gamification 0.9

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-045 | Personal local XP ledger, level thresholds and twelve derived badges | 66 TS tests, typecheck/lint PASS; old snapshot migration and correction/replay covered. Separate from trusted server XP; no public ranking |
| RJ-046 | Bilingual achievements page and home/More entry | Browser participation/persistence/undo/redo/filter and Arabic/English layout PASS; Android cold launch PASS; native XP/badge display and retained data confirmed by the user |
| RJ-047 | Private 0.9.0 APK and installation | Build/signature/129 inputs/23 compiled sources/font/audio PASS; installed over 0.8.0 and cold-launched on Android 16; native XP/badge display and retained data confirmed by the user |

## Connected daily journey 0.10

| Ticket | Slice | Evidence state |
|---|---|---|
| RJ-048 | Personalized daily Home and separate More/Settings | Implemented; real ESA countdown, selected companion persistence and bilingual/mobile browser QA PASS |
| RJ-049 | Date-aware weekly/monthly reports | Domain tests and synthetic habit-to-7/30-day browser reports PASS; no invented historical reading dates |
| RJ-050 | Optional setup with city, companion choices and reminders | Migration and browser setup/search/persistence PASS; optional reminders retain their existing opt-in flow |
| RJ-051 | Native queued background Quran recitation and sleep timer | Queue/timer unit and isolated native timer checks PASS; user confirmed final recitation/notification after startup repair. Full physical sleep/headphone/Doze matrix remains a release gate |
| RJ-052 | ESA-backed Android home-screen widget | Policy/native registration/layout checks PASS; user confirmed the widget appeared |
| RJ-053 | Optional accounts, private profile caches and CAS outbox/conflicts | Local outbox/conflict tests and hosted authorization PASS; user confirmed native PKCE login, explicit guest import/private sync and retained records. Public mail delivery remains gated |
| RJ-054 | Connected preview APK and release/accessibility evidence | Verified/signature/178 inputs/44 compiled sources/12 recordings/media-patch PASS; final Android 16 install and user acceptance PASS. Doctor 20/20, 81 TS, 22 native, 5 hardware and web export PASS; five audit findings and production gates remain documented |
| RJ-055 | Remove final 57 seconds of Isha Adhan | Exact sample/waveform and other 11 recordings PASS; packaged hash PASS; user confirmed cutoff |
