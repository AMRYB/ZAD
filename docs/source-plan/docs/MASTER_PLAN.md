# RAMADAN JOURNEY — MASTER PRODUCT & DELIVERY PLAN

**Version:** 1.0
**Audience:** product owner, designer, developer, Codex coding agent, QA, release engineer  
**Target:** installable Android APK for private beta, with a production-ready Android App Bundle (AAB) for subsequent Play Store release  
**Primary application language:** Arabic (RTL), regardless of system language on first launch  
**Secondary language:** English (LTR), selectable and persistent in Settings  
**Implementation discussion / daily status language:** Arabic  
**Specification, tasks, architecture documents, code identifiers and conventional commit subjects:** English  
**Quran content provider:** King Saud University Ayat website only (`https://quran.ksu.edu.sa`)  
**Project maturity:** existing Expo/React Native prototype with a KSU Quran reader and limited tests; **no verified distributable APK yet**.

> This plan documents a target product, NOT a claim that all functionality is already implemented. Use the acceptance gates and release checklist to determine the actual status.

## 1. Vision and boundaries
Build an accessible, trustworthy Ramadan companion with a daily dashboard, authentic Quran viewer, reading/listening/memorization journeys, worship habit tracking, goals, optional social challenges and opt-in leaderboards, point-based cosmetic rewards, personal journaling, statistics and a useful year-round mode. Avoid treating gamification points as a measure of religious merit. Never make publicly observable worship details the default.

**Success measures:** a stable offline daily tracking flow; Quran content served from KSU with faithfully aligned overlays and traceable requests; Arabic-first end-to-end UX; user-controlled privacy; reliable event-based XP; signed installable APK; build reproducibility; low crash rate; privacy-preserving metrics.

**Non-goals for the first APK:** monetization; in-app purchases; public social feed; social pressure around private worship; AI-generated Quran verses; unreviewed fatwas; full multi-reciter content without verification; an unapproved bulk mirror of KSU content.

**Shipping policy:** MVP / Beta can ship core flows with clearly disabled and hidden later-phase modules. Do not display broken buttons or label planned features as complete.

## 2. Existing implementation and provenance
Current archived prototype `ramadan-journey-ksu-v1` contains:
- `App.tsx`, local Ramadan tracker model and theme, early daily dashboard and progress.
- KSU Quran reader screen, endpoint helpers, KSU navigation metadata, Quran image overlay and verse audio progression.
- Safe plain-text extraction for Saadi tafsir; last selected verse saved locally.
- Fixtures + unit tests matching **52 highlight rectangles on KSU pages 1–3**, with **seven** navigation boundary tests.
- Historical network capture for a **sample** of KSU endpoints, not all 604 pages or 6,236 verses.

**Known gaps:** no approved public KSU content usage permission on record; mobile real-device build unverified; no completed external Auth/sync/Gamification backend; no verified production-ready APK; no exhaustive 604-page highlight visual QA. The existing code is a reference implementation, not a shippable production baseline.

## 3. Official product decisions
| Topic | Locked decision |
|---|---|
| App purpose | Ramadan-first, year-round useful |
| Platform | Android APK first; iOS can follow from shared React Native code |
| Language | Arabic default; English through Settings; every feature translated |
| Direction | Arabic RTL, English LTR; navigation and gestures adapt |
| Light UI | Islamic Emerald (palette below) |
| Dark UI | Midnight Navy + Gold (palette below) |
| Default theme | Follow system theme; manual Light/Dark override |
| Quran source | All remote Quran image, verse audio, tafsir and highlight content must be requested only from KSU Ayat; no substitute provider on failure |
| Quran presentation | Original KSU PNG pages unaltered, overlay separately for highlighting |
| Social participation | Off by default, alias-based, opt-in, private details hidden |
| Points | For app participation and goal tracking, not proof of worship or spiritual virtue |
| Online account | Optional for local-only tracking; required for cloud/social ranking |
| Offline | Daily tracking works offline; KSU network resources load online unless permitted cache is in place |
| Notifications | Explicitly opt-in with quiet hours |
| Progress reporting | Arabic to user after each meaningful development task |

## 4. Visual system: chosen two palettes

### Light — Islamic Emerald (selected from Option 1)
| Token | Color | Role |
|---|---|---|
| `background` | `#F8FAF7` | Main screen |
| `surface` | `#FFFFFF` | Cards, sheets |
| `primary` | `#176B57` | Primary CTA, navigation, selected state |
| `accent` | `#C99A42` | Icons, badges, ornamental highlights; **not small text on white** |
| `text` | `#172D27` | Foreground |

### Dark — Midnight Navy + Gold (selected from Option 2)
| Token | Color | Role |
|---|---|---|
| `background` | `#0B1323` | Main screen |
| `surface` | `#15223A` | Cards, sheets |
| `primary` | `#9ABCEB` | Primary interactive accent |
| `accent` | `#E4BC74` | XP, achievements, emphasis |
| `text` | `#F2F5FC` | Foreground |

**Contrast and design constraints:** light primary `#176B57` on white is roughly **6.4:1** and light text `#172D27` on light background roughly **13.9:1**. Gold `#C99A42` on white is about **2.6:1**, therefore use gold as icon fill, borders or large decorative accent; use dark text for readable labels. Dark primary, gold and text all have strong contrast on the dark background. Provide explicit success/error/warning tokens, surface variations, focus rings and accessible disabled states in a subsequent token audit; do not rely on green/red alone.

**Appearance:** premium, restrained, clear information hierarchy, small geometric Islamic accents, large Arabic labels, generous tap targets, smooth card corners; avoid visually competing with the Mushaf. The Quran page PNG must retain original pixels/colors, unfiltered. Splash can have richer decorative artwork, utility screens should be calm.

**Arabic typography:** choose a legible licensed Arabic UI family (e.g., a supported Naskh/Kufi family after license review), separate from Quran PNG. No user interface Arabic copy baked into images. Direction-aware icons and charts.

## 5. Navigation & complete screen inventory
**Bottom navigation (5 tabs):** Home | Quran | My Day | Progress | More. Icons and labels switch layout direction per locale. Submodules are accessed by typed navigation routes; optional deep links reference safe IDs only.

**A. Access and onboarding (8):** Splash; Welcome; Language/Theme introduction; Personal goals questionnaire; Ramadan location/calendar preferences; Sign in; Register/Recover account; Notifications/Privacy consent.

**B. Home & Ramadan calendar (7):** Home dashboard; Daily details; Ramadan month grid; Ramadan night planner; Last-ten-nights mode; Quick Actions; Daily recap.

**C. Quran experience (12):** Quran home; Surah list; Mushaf reader; Page/surah/ayah picker; Audio controls; Tafsir sheet; Saved bookmarks; Last-read history; Khatmah plan list; Khatmah editor; Memorization plan; Revision sessions.

**D. Worship and lifestyle tracking (12):** Prayer record; Prayer time schedule; Fasting log; Fasting makeup plan; Adhkar categories; Adhkar detail/counter; Personal dua lists; Dua detail; Daily activities; Habit tracker; Journal; Sleep/water wellbeing tracking (optional, neutral framing).

**E. Goals & analytics (8):** Goal dashboard; Goal editor; Daily tasks; Weekly review; Analytics dashboard; Reading analytics; Ramadan end-of-season recap; Export/share-private recap.

**F. Gamification & social (11):** Player profile; Achievement cabinet; Badge details; XP transaction history; Challenge directory; Challenge details; My challenges; Leaderboard scope switch; Friends/invitations; Group details; Cosmetic reward catalog.

**G. Settings/support/admin (12):** Settings; Language; Theme; Prayer calculation method; Hijri date/manual adjustment; Location preferences; Reminder controls; Privacy/visibility; Data import/export; Account/delete account; Help/contact; About/source credits. Admin/moderation is web/backend only and not included as a normal mobile tab.

**Estimated destination inventory:** 70 routes/sheets; several may share templates. Design inventory should be maintained as exact route IDs in `SCREEN_MATRIX.md` rather than promising 70 isolated implementations.

## 6. Module requirements and acceptance gates

### EPIC 01: Foundation, access, settings
- Expo + TypeScript + Expo Router; modular feature directories; env separation; logger with redaction.
- Guest local-first mode; Auth sign-up/login/forgot-password; account upgrade without losing local data.
- User-controlled Arabic/English (saved locally and in profile if signed in); theme system/light/dark.
- Arabic is default regardless of system locale, while Settings can switch to English; RTL and LTR for app content, stack gestures, back buttons, tab order, modals, sheets, calendars and charts.
- Permission requests only at moment of relevant action. Account deletion and export pathways.
**Acceptance:** launch defaults Arabic; switching English updates all visible content and layout (document if a restart is necessary on a specific SDK); relaunch preserves chosen preference; sign-out hides private cloud data.

### EPIC 02: Calendar and seasonal engine
- User-selectable location/calendar authority and sighting adjustment for 29/30-day Ramadan; separate Gregorian timestamp/timezone.
- Daily boundaries, travel, midnight, hijri month rollover, out-of-season behavior.
- Day-by-day completion and upcoming special nights without asserting a fixed Laylat al-Qadr date.
**Acceptance:** unit scenarios cover a 29-day season, 30-day season, DST timezones and manual date correction without losing old check-ins.

### EPIC 03: Smart home dashboard
- Today's Ramadan day, optional next prayer, next goal, Quran plan, quick check-ins, motivational but non-judgmental cards.
- No placeholder counts masquerading as completed prayers or Quran pages.
- Offline fallback from local records.
**Acceptance:** every displayed statistic equals the underlying local/cloud record; loading, empty and error states present.

### EPIC 04: KSU Quran reader (critical)
- Render unmodified `/ayat/safahat1/{page}.png`; exact uniform scale from 456×672 geometry; viewport control.
- Fetch KSU `hilites` with `ui=pc&do=hilites&mosshaf=hafs&t=28&page=p`; compute page-specific 1–3 rectangles/verse; tap overlay to select.
- Audio URI `/ayat/mp3/Husary_64kbps/{SSS}{AAA}.mp3`; play verse by verse, stop, next, previous, resume, repeat only after validation.
- Saadi tafsir `do=tafsir&author=sa3dy`; page meanings `do=tarjama&tafsir=ar_mu...`; parse `|||` safely and treat returned HTML as **untrusted**, render safely without executing scripts.
- `quran-data.js` sourced from KSU with license attribution; validate page, surah, verse against metadata.
- Page transitions, bookmarks, last read and session completion **by explicit user action**, not counting page scroll as worship.
- Failure shows the original image (when available) with disabled overlays; no alternative Quran provider.
**Acceptance:** reference fixtures identical for pages 1–3; visual QA includes first, middle, last, surah boundary, 2-surah page, single-line, multiline, landscape/rotation; playback progression and cancellation work on real Android; KSU usage terms approved before broad release.

### EPIC 05: Khatmah plans and memorization
- Multiple plans, target date, reading progress by page/ayah, custom daily assignment and catch-up logic.
- Separate listening and reading counters; manual correction; memorization repeats, session revision logs.
- Avoid calculating precise verse-to-word timing from KSU's per-ayah MP3 where it is not available.
**Acceptance:** no duplicate pages from repeated sessions; reschedule skipped days; multiple concurrent plans don't overwrite each other.

### EPIC 06: Prayer tracking and times
- 5 prayers, optional Sunnah, Taraweeh, Qiyam; neutral status: unlogged/completed/skipped/excused where relevant.
- Prayer times based on a specifically chosen calculation method and verified reference calendar; independent from Quran content and clearly labeled, with manual correction.
- Notification permissions and timing behavior under timezone changes.
**Acceptance:** no fabricated prayer times or notifications; tracking remains private and editable; denial of location permission has city selection fallback.

### EPIC 07: Fasting and makeup days
- Logged/unlogged fast, optional private reasons, target makeup days, progress.
- Optional menstrual/health details are sensitive: omit by default, use explicit consent and limited access if ever included.
**Acceptance:** totals account for unlogged days; nothing exposed in shared profiles or boards.

### EPIC 08: Adhkar and duas
- Reviewed, attributed adhkar and dua library with sources and editorial approval; personal duas are private.
- Category browsing, optional reminders, favorite, tasbih counter and auto-save; no fabricated hadith or unverifiable religious certainty.
**Acceptance:** source reference accessible per item; no analytics upload of private personal dua content by default.

### EPIC 09: Tasks, goals, habits and journal
- Flexible daily/weekly/season goals; recurring tasks, measurable units, schedule, pause/edit; optional gratitude/journal.
- Private-first personal notes, attachments excluded from beta unless security reviewed.
**Acceptance:** edits produce correct historical stats; offline change sync deduplicates on reconnect; journal never appears in leaderboard.

### EPIC 10: Charity and Zakat
- Donation goal and private log, optional schedule and vetted external charities only after compliance review.
- Zakat calculator only after scholarly/jurisdictional validation; transparent inputs and assumptions; not a binding religious ruling.
**Acceptance:** no payment initiation without trusted integration and explicit consent; exact rate/date sources shown.

### EPIC 11: Education
- Editorially verified lessons, topics, learning plans, short quizzes, completion history.
- Quran quotations must use KSU source path or source-controlled reviewed snippet provenance, never a generative model.
**Acceptance:** content provenance and reviewer tracked; no citationless religious claims.

### EPIC 12: Achievements and XP (critical)
- Event ledger awarding **non-financial virtual XP** when valid activities are recorded; badges, levels, profile customization.
- Example rules: first daily check-in 5 XP; completing a self-defined reading-plan session 10 XP; reviewing weekly plan 15 XP; weekly challenge 50 XP. Cap daily XP and one event per source activity; XP rewards **app participation**, not divine reward.
- Level example: `level = floor(sqrt(total_xp / 100)) + 1` (placeholder; economy review required). Store immutable transactions + reason/idempotency key.
- Cosmetic rewards only, no redemption for money, randomized purchases or gambling-like mechanisms.
**Acceptance:** repeated/offline requests never double-award XP; modifying or deleting activity follows a documented adjustment rule; no direct client writing of trusted points balance.

### EPIC 13: Leaderboards and challenges (critical)
- Opt-in global, friends, groups and seasonal/week-based rankings, plus private-only progress mode.
- Use alias and avatar; no public prayer/fasting records or personal notes. User may hide profile and leave board at any time.
- No leaderboard for minors without age-appropriate review; block/report/mute on social surface.
- Group invite codes, simple challenges and progress totals; anti-bot/rate limits, server-authoritative XP.
- Ranking policy: total eligible capped XP per season, tie-break earliest achievement timestamp only if acceptable; historical archived board after season, ability to erase account.
**Acceptance:** user visibility enforced via RLS/server check; user cannot self-set XP; global board shows only consented public profiles; all requests are bounded/paginated.

### EPIC 14: Analytics, reviews and after Ramadan
- Reading stats versus plan, habit completion, weekly reflection and an end-of-Ramadan recap; private export.
- Year-round Quran, weekly goals, voluntary fasting and continuing habits.
**Acceptance:** totals reconcile to event records; fresh season doesn't erase old season history.

### EPIC 15: Family and community (future)
- Family/circle permissions; opt-in visible goals only; parent/child controls require a separate design and risk review.
- Community activities and volunteering are outside beta until moderation and privacy policies exist.

### EPIC 16: Optional AI planning (future)
- Can suggest planning/catch-up schedules on opt-in; never invent Quran verses, rulings, or divine reward claims.
- No use of journal or personal worship logs for model requests without explicit granular consent.
**Acceptance:** AI features are completely optional and have deterministic non-AI alternative flows.

## 7. User journeys (required end-to-end tests)
1. First launch → Arabic welcome → guest → choose Light/Dark → define goals → Home → check in → kill/restart → state persists.
2. Settings → Language → English → LTR navigation → restart if needed → switch back Arabic → preferences retained.
3. Quran → Surah list → Fatiha → select 1:4 → Saadi tafsir → play Husary → advance to 1:5 → bookmark → return tomorrow.
4. Quran → Baqarah page 2 → page 3 → multi-line selection → final page 604 → change text scaling → overlays remain correct.
5. Ramadan goal → miss a day → reschedule → confirm adjusted target → progress consistent.
6. Join challenge as opt-in user → complete eligible activity → server validates XP → appearance on friends leaderboard → leave leaderboard → public visibility disappears.
7. Offline add/check/edit → reconnect → outbox replays → no duplicates → remote data matches local.
8. Disable all notifications → day/week reports remain accessible without push.
9. Export account data → request account deletion → auth, profile, share and XP data no longer publicly visible.

## 8. Implementation architecture

```text
apps/mobile/                  # Expo React Native + Expo Router
  app/(onboarding)/
  app/(tabs)/                  # home, quran, my-day, progress, more
  app/quran/                  # reader, tafsir, planner, bookmarks
  app/leaderboard/            # opt-in, friends, groups
  src/features/{quran,calendar,tracker,goals,prayer,gamification,analytics,...}/
  src/components/ui/
  src/theme/tokens.ts
  src/i18n/{ar,en}.json
  src/providers/
  src/storage/                 # SQLite, offline outbox
  src/services/{ksu,notifications,auth}/
  tests/{unit,integration,e2e}/
packages/shared/              # types, zod schemas, pure rules
supabase/{migrations,functions,tests}/
docs/{product,architecture,security,qa,release}/
.github/workflows/
```

**Suggested stack:** Expo/React Native + TypeScript; Expo Router; `expo-localization` + i18n-js or i18next (choose one); Zustand (local UI state); TanStack Query (remote server state); SQLite for offline records; Supabase Auth/Postgres + RLS + Edge Functions; expo-notifications; expo-audio; tests with Jest/Vitest (pure TS), React Native Testing Library, Maestro/Detox for E2E depending on setup; EAS Build. Exact package versions must be selected to match the installed Expo SDK.

**Providers:** `KsuQuranProvider` (exclusive KSU Quran content), `PrayerTimeProvider` (separate verified calculation/authority), `ContentLibrary` (editor-reviewed adhkar/hadith) with clearly distinct provenance. Do not silently merge religious-text providers.

**Offline sync:** local change journal/outbox, stable UUID, createdAt/updatedAt, schema version, per-entity conflict policy; send only permitted data. Private worship data must not leak through public analytics or social APIs.

## 9. Data model / database domains
- `profiles` (user_id, alias, language, theme, visibility, created_at)
- `user_settings`, `consents`, `notification_preferences`
- `ramadan_seasons`, `season_calendar_adjustments`, `daily_records`, `prayer_records`, `fasting_records`
- `goals`, `goal_events`, `habits`, `habit_events`, `daily_tasks`, `journal_entries`
- `quran_bookmarks`, `quran_reading_sessions`, `khatmah_plans`, `khatmah_assignments`, `memorization_plans`, `review_sessions`
- `personal_duas`, `adhkar_progress`, `charity_logs`, `education_progress`
- `xp_rules`, `xp_events`, `levels`, `achievement_definitions`, `user_achievements`, `rewards`, `owned_cosmetics`
- `leaderboard_seasons`, `leaderboard_entries` (materialized/server computed), `friendships`, `groups`, `group_members`, `challenges`, `challenge_participants`, `reports`, `blocks`
- `content_sources`, `content_reviews`, `audit_events` (redacted), `sync_mutations`, `device_installations`

**Key constraints:** `xp_events` must contain unique `(user_id, source_type, source_id, rule_version)` idempotency key; balances are server computed; user content tables RLS per authenticated user; public alias/totals materialized separately from private event details; soft deletion handled with controlled access and eventual erasure policy. Do not expose `service_role` keys inside the mobile app.

**Migration delivery:** create one versioned SQL migration per domain + RLS policy tests; never hand-edit production tables without migration. `schema.sql` in the old prototype is reference-only until upgraded.

## 10. Security, privacy and reliability requirements
- Enforce minimum permissions, Supabase RLS on every exposed table, explicit storage access and public-view policies, JWT verification for functions, rate limits and input validation.
- Never trust client-computed points; award XP via authenticated server action with transaction/idempotency.
- Store secrets only in secured EAS/server environments, not Git, APK, client constants, crash logs or Android app preferences.
- User can use local core app without account; cloud sync requires explicit sign-in; export/delete tools are visible.
- Minimize collection of location (manual city preferred where possible), private prayers, reasons for fasting exemption and journal details.
- Avoid scraping all KSU content or redistributing bundled Quran assets without verified permission. Cache only within approved terms; use conditional fetching and respectful request volume.
- Performance: paginated lists, image prefetch only adjacent pages when permitted, React Native virtualization, debounce requests and cancellation; no large in-memory all-page images.
- Accessibility: Dynamic Type, 44/48dp controls, VoiceOver/TalkBack, text equivalents, contrast checks, respects reduced motion.

## 11. Delivery phases and dependencies
The following phases describe implementation scope and estimated effort. Revise estimates after staffing and dependency review.

| Phase | Estimated effort | Deliverables | Release gate |
|---|---|---|---|
| P0 Audit & foundation | 1–2 weeks | Run prototype, Expo SDK compatibility, migrate into repository, Git/CI, issue tracker, exact dependency versions | Android dev build works; clean boot; baseline tests pass |
| P1 Design & bilingual core | 2–3 weeks | UI kit, both themes, Arabic-first Settings, runtime locale direction, onboarding, navigation | Screens render RTL/LTR; translations 100% on delivered screens |
| P2 Core tracking | 3–4 weeks | Calendar, prayers/fasting tracker, goals/habits, storage, dashboard, local analytics | Real-device offline persistence and date edge tests pass |
| P3 Quran hardening | 3–4 weeks | KSU viewer, tafsir, audio, 604-page edge visual audit, khatmah planner, bookmarks | KSU permission review + Quran QA matrix cleared |
| P4 Backend and sync | 3–4 weeks | Auth, Postgres, RLS, sync outbox, privacy, deletion/export | Data isolation and offline replay E2E pass |
| P5 Gamification & social | 3–4 weeks | XP ledger, levels, achievements, opt-in leaderboard, challenges, reporting | Anti-cheat, RLS, abuse controls, opt-out tests pass |
| P6 Secondary features | 3–5 weeks | Adhkar, dua, journal, verified education, charity tracking, reminders, last-ten-nights | Sources reviewed; permissions and accessibility checks pass |
| P7 Android release | 2–3 weeks | EAS preview APK, internal beta, crash fixes, Play Store AAB | Release checklist + sign-off complete |
| P8 Year-round / optional AI | later | Family features, AI planning, advanced content, widgets | Separate safety and product review |

**Practical speed:** if the target is an APK soon, ship **P0–P3 as a private offline MVP** first; include gamification in a second beta after P4–P5. Don't bundle unfinished social features simply to make the APK appear feature-rich.

## 12. Detailed QA & acceptance matrix
- **Build:** clean install, upgrade install, cold start, force-close, package identifier/signature, offline startup, Android back gesture, background/foreground.
- **Language:** Arabic on EN-language phone; English setting on AR-language phone; RTL/LTR navigation; digits, dates, Arabic pluralization, notifications, clipping at 200% text scale.
- **Themes:** Light Emerald, Dark Navy Gold; contrast, cards, disabled states, SVG/icons, actual KSU page remains unfiltered.
- **KSU:** PNG 1/2/3/4/50/301/604; audio 1:1, 1:4, randomly sampled verses with playback; tafsir and page meanings samples; highlight center, multi-line, surah header, final page; API failure/timeout; no fallback provider.
- **Calendar:** Ramadan 29/30 days, manual hijri offset, timezone change, leap year, pre/post Ramadan.
- **Offline:** record updates while disconnected; background; repeated sync replay; deletion and conflict.
- **Auth/security:** forbidden cross-user queries; RLS; token expiry; injection/HTML untrusted parsing; social consent; account removal; overposting, duplicate XP.
- **Gamification:** idempotency, daily cap, XP reversal, tie logic, friends-only vs public, block/report, limit pages, season reset.
- **Analytics:** every score equals source-of-truth, no implicit reading credit on page view, no sensitive info in telemetry.
- **Devices:** budget Android, current Android, small/large device, font scale, dark/light OS, low memory, spotty network.
- **Release:** APK install and checksum, verified signing, fresh env secrets, crash-free beta sample, privacy policy and content attribution/legal permission.

## 13. APK, AAB and release approach
- EAS preview build uses `android.buildType = "apk"`; APK can be installed directly for testers.
- EAS production build generates AAB for Google Play by default; an AAB is not a direct-install APK.
- Developer must configure a globally unique reverse-domain Android package name; `com.example.ramadanjourney` is a placeholder and must be changed before publication.
- CI: lint/typecheck/unit tests → Android preview build → smoke install on physical Android → internal distribution → QA → production AAB.
- No build is "finished" until an `.apk` file actually exists, downloads, installs, launches and passes smoke tests on hardware.
- Detailed commands and EAS configs: `docs/ANDROID_APK_RELEASE.md` and `config/eas.json`.

## 14. Contribution workflow

- Use conventional commit subjects such as `feat(quran)`, `fix(i18n)`, `test(storage)` and `docs(release)`.
- Keep each change focused and run the relevant checks before committing.
- Use `main` and focused feature branches as appropriate.

## 15. Communication and operating instructions for Codex
- Execute implementation tasks one by one; don't mark tasks done from descriptions or screenshots alone.
- Before each task, tell the user in Arabic: current work, affected files, risk and how it will be tested.
- After each task, report in Arabic: files changed, functionality, test results, known issues, next immediate action and the real Git commit hash (if made).
- Keep master docs, ticket titles, commit subjects, code comments as English unless domain-specific Arabic UI translation content is required.
- Never assert that an APK was built before verifying the exact output path on disk/EAS and a real installation.
- Avoid requesting access to the user's entire device; use least-privilege tools and consent.
- Follow `AGENTS.md` in the handoff package.

## 16. First ten real execution tickets
1. `RJ-001` Set up a reproducible Expo workspace, TypeScript checks, lint, .gitignore, CI.
2. `RJ-002` Import/port the prior KSU prototype with tests unchanged; document known gaps.
3. `RJ-003` Add design token system with Islamic Emerald Light and Midnight Navy Gold Dark.
4. `RJ-004` Add persistent Settings language selection (Arabic default + English option).
5. `RJ-005` Implement RTL/LTR direction-aware components and navigation tests.
6. `RJ-006` Build bottom tab structure and component library.
7. `RJ-007` Build calendar engine for 29/30 days + tests.
8. `RJ-008` Build offline storage/migrations for check-ins and goals.
9. `RJ-009` Complete Quran KSU reader UX and real-device QA (first, boundary, last pages).
10. `RJ-010` Produce the **first real installable Android preview APK** and record installation result.

**Definition of Done per ticket:** feature works on supported device; no fabricated data; tests pass; RTL and English reviewed; loading/error/empty states; security/privacy impact reviewed; docs updated; real commit made; Arabic update delivered.
