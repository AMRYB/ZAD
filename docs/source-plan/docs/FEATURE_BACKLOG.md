# FEATURE BACKLOG & SCREEN ACCEPTANCE

**Status legend:** `EXISTING-UNVERIFIED`, `PLANNED`, `IN PROGRESS`, `TESTED`, `RELEASED`, `BLOCKED`. Never promote an item without evidence.

## Prioritized epic matrix
| ID | Feature area | Priority | Example tickets | Main acceptance evidence |
|---|---|---|---|---|
| RJ-01 | Foundation/CI | P0 | workspace, lint, types, EAS | CI green; APK installs |
| RJ-02 | Design system | P0 | 2 locked themes, cards, icons | screenshots in light/dark, contrast check |
| RJ-03 | Localization | P0 | Arabic default, Settings English, RTL/LTR | native screenshot and navigation tests |
| RJ-04 | Onboarding | P0 | guest, goals, privacy | first launch + relaunch E2E |
| RJ-05 | Calendar engine | P0 | season 29/30, timezones, day grid | deterministic date unit tests |
| RJ-06 | Home dashboard | P0 | cards, quick actions, progress | every displayed count reconciled |
| RJ-07 | Quran KSU | P0 | images, hilites, tafsir, audio | device QA + fixtures + source check |
| RJ-08 | Local tracking | P0 | prayers, fasts, notes, tasks | offline persist/edit states |
| RJ-09 | Goals/Khatmah | P0 | progress, due plans, catch-up | skip-day / multi-plan tests |
| RJ-10 | Android APK Beta | P0 | signing, EAS preview, smoke | `.apk` exists, installs, launches |
| RJ-11 | Auth/Profile | P1 | login, recovery, optional guest migration | account data isolation |
| RJ-12 | Cloud sync | P1 | outbox, conflict, resume, deletion | offline-to-online E2E |
| RJ-13 | Achievements | P1 | badges, eligibility, tiers | idempotent unlock events |
| RJ-14 | XP/Leveling | P1 | ledger, caps, levels, reversal | server-only awarded points |
| RJ-15 | Leaderboards | P1 | global/friends/groups, opt-in | private data never exposed |
| RJ-16 | Challenges | P1 | missions, group invites | verified participant state |
| RJ-17 | Adhkar/Dua | P1 | sources, list, counter, favorites | source attribution & privacy |
| RJ-18 | Prayer timings | P1 | methods, city/manual correction | selected authority comparison |
| RJ-19 | Notifications | P1 | permissions, reminders, quiet times | on-device timing tests |
| RJ-20 | Analytics | P1 | daily/weekly/season | derived totals match raw records |
| RJ-21 | Journal | P1 | notes, reflections, export | private + offline recovery |
| RJ-22 | Last 10 Nights | P1 | adjustable plan | no fixed Laylat al-Qadr claim |
| RJ-23 | Charity tracking | P2 | donation goals, local records | no unsupported payment transfer |
| RJ-24 | Verified lessons | P2 | quizzes, progress | editorial sign-off |
| RJ-25 | Cosmetic rewards | P2 | earned theme/border/icon | points non-monetary and capped |
| RJ-26 | Family circles | P2 | shared voluntary goals | granular consent & block controls |
| RJ-27 | Year-round mode | P2 | Quran, voluntary fasting, habits | season boundary preserves history |
| RJ-28 | AI Planner | P3 | opt-in plan edits | no invented religious claims |

## MVP cut: APK beta 0.1
Ship RJ-01 through RJ-10 only. Build optional static placeholder for later areas? **No**. Hide unreleased tabs/routes entirely. Social login, global boards, reward economy, and AI are not beta 0.1 promises.

## Beta 0.2 cut
Ship Auth/sync/privacy, XP/achievements, opt-in leaderboard, challenges, plus reviewed content when ready. Another APK build is needed; each build carries version+release notes.

## UI page-level acceptance template (copy for each route)
- [ ] Arabic labels and errors translated; English reviewed.
- [ ] RTL/LTR focus order, gestures, layout and icon direction verified.
- [ ] Light/dark tokens applied; Quran PNG colors unchanged.
- [ ] Busy / empty / offline / error / retry states complete.
- [ ] State persists after force close.
- [ ] Inputs validated and assistive labels available.
- [ ] Analytics, notification and consent boundaries respected.
- [ ] Feature integration or unit tests pass.

## XP game economy — first safe draft
| Eligible action | Proposed XP | Notes |
|---|---|---|
| First check-in activity of day | 5 | one per day; not each prayer separately |
| Complete a personal reading-plan session | 10 | explicit completion; once per valid session |
| Weekly review | 15 | one per calendar week |
| Complete a productivity mission | 25 | only verified in app |
| Complete a weekly challenge | 50 | server-validated, bounded |

**Caps:** start at max **100 XP/day** on personal actions; weekly challenge awarding is separate with review of abuse. These are **example values subject to playtesting**, not a measure of piety. Rank participation default private/off. No XP earned for journal details, fasting reasons or unverified time spent staring at an image.

**Fraud/duplicate cases:** same source twice, delayed offline replay, overlapping clients, manual clock edit, undo event, deleted account, banned profile, swapped season. Include all in tests.

## English issue naming format
`RJ-014 [P0] As a user, I can switch from Arabic to English in Settings without losing state`.

## Sample progress report in Arabic (the agent must follow)
"النهارده خلصت RJ-014: أضفت تغيير اللغة من الإعدادات، وضبطت اتجاه الواجهة. الملفات: ... . الاختبارات: ... نجحت و... لم أختبره بعد. الـ Commit: abc1234. الخطوة التالية: ... ."
# User-requested extension — official Egyptian Adhan

- RJ-030: Reader card balance and arrow removal — implemented; browser evidence in `docs/ADHAN_VERIFICATION.md`.
- RJ-031: ESA-only prayer timetable contract and validation — implemented with captured public fixtures and strict city/date checks.
- RJ-032: Native Android prayer reminders and Egyptian Adhan audio — implemented; isolated real-device background and cold-start checks executed.
- RJ-033: More → Adhan, saved city and dated timetable, setup/status UI — implemented; bilingual browser flow checked.
- RJ-034: ZAD 0.5.0 private APK and final device acceptance — built, signed and installed over 0.4.1; user completed city/permission setup and confirmed test notification plus audible Adhan with screen locked. 40 TypeScript and six native parser tests passed; Expo Doctor 19/20 patch advisory remains.
- Product APK build/installation evidence is maintained in `docs/ANDROID_APK_RELEASE.md`; isolated module tests and final product tests are documented separately.


- RJ-035: Prayer-specific voices, MBC intros and Friday Al-Azhar selection — catalogue and Cairo-date policies implemented; mapping/boundary tests pass. See `docs/ADHAN_AUDIO_V0_6.md`.
- RJ-036: Native sequential intros/Adhan, stoppable queue and per-prayer preview — implemented; six real-device playback transitions and intro cancellation passed; private clips stay outside public Git.
- RJ-037: ZAD 0.6.0 private APK — built, signed, source/font/audio verified and installed over 0.5.0; final Friday locked-screen acceptance is recorded separately in the release metadata.

- RJ-038: Isha recording correction — removed exactly 5.6 seconds from the Isha Adhan only, verified the retained waveform and eleven unchanged files, updated the pinned hash/duration, and built/verified/installed 0.6.1 over 0.6.0 on Android 16. Typecheck/lint, 44 TypeScript and 11 native tests PASS. New patch listening/locked-screen test not repeated; the user confirmed the previous 0.6.0 Friday test.

- RJ-039: Prayer notification controls — implemented ten-minute countdown, one-prayer mute/undo and current playback mute/unmute with session-safe controls. Typecheck/lint, 44 TypeScript and 15 native tests PASS; actual notification actions and scheduled muted alarm passed on isolated Android 16 hardware. See `../../ADHAN_NOTIFICATIONS_V0_7.md`.
- RJ-040: ZAD 0.7.0 private APK — build/signature/109 inputs/seven compiled sources/font/twelve audio hashes and native actions verified; installed over 0.6.1 and cold-launched on Android 16 with permissions retained. New final-product user acceptance not repeated. See the current release metadata.

- RJ-041: Animated Tasbih — bead-loop tap/pull counting, independent saved phrase counters, round goals, undo/reset and optional haptics; browser and user-confirmed Android counting/haptics/toggle PASS.
- RJ-042: Adhkar — 90 source-pinned entries in six sections from the user-selected Risala edition, full included text/citations, scoped repetition counts, favorites, last position and editable optional reminders.
- RJ-043: Good Deeds — eight selectable suggestions, private custom/archived choices, reversible daily check-ins, weekly records and three editable opt-in reminders. Browser selection/custom/reload/archive checks and isolated Android reminder delivery PASS.
- RJ-044: ZAD 0.8.0 private APK — built, source/signature/font/audio/native-module verified and installed over 0.7.0 on Android 16. User confirmed native count/haptics/off-toggle. 54 TypeScript and 20 native tests PASS; Doctor 19/20 and existing audit findings recorded. No public/Play release.

- RJ-045: Requested personal offline XP/levels/achievements slice implemented; 66 TS tests and typecheck/lint PASS. No deployment or completion claim for original RJ-14 server-only XP, RJ-11/RJ-12 Auth/sync, or RJ-15 leaderboards. See `../../GAMIFICATION_V0_9.md`.
- RJ-046: Bilingual achievements UI implemented; browser flow and responsive/locale/theme checks PASS; Android cold launch PASS; user confirmed displayed XP, a badge and retained previous data.
- RJ-047: Private 0.9.0 build/signature/source/font/audio checks PASS; update over 0.8.0 and Android 16 cold launch PASS, permissions retained; user confirmed displayed XP, a badge and retained previous data.
