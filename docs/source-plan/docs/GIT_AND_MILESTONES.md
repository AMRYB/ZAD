# GIT COMMITS, APRIL–OCTOBER 2026 CONTEXT & DELIVERY LOG

## What is known
The user's source archive, KSU endpoint capture and local tests exist in the current conversation as of October 22, 2026. There is **no supplied `.git` history** proving continuous development since April 2026. A synthetic retrospective calendar is not evidence of historical work. Do not alter historical commit timestamps to represent unperformed work.

## April to October — explicitly retrospective PRODUCT STORYBOARD, not Git facts
| Month | Suggested phase narrative (not a claim it happened) | Evidence needed to label as completed |
|---|---|---|
| April 2026 | Discovery: Ramadan use cases, initial scope, competitor research | actual April dated notes/files/log |
| May 2026 | UX exploration: Arabic navigation, app shell, palette exploration | actual dated design exports or history |
| June 2026 | Architecture/initial tracker concept and data model | actual saved source snapshots/logs |
| July 2026 | Basic prayer/fasting/goals tracking and offline storage concept | dated source or test artifacts |
| August 2026 | Quran provider evaluation, initial prototype direction | dated notes, tests or source history |
| September 2026 | Reader architecture and KSU-focused integration research | dated KSU request captures or code |
| October 2026 | Verified KSU captures/fixtures, UI concepts and written requirements | provided Oct 22 code/evidence |

If dated authentic evidence exists, import it as docs or authentic commits. Otherwise keep this table tagged **retrospective plan**.

## Real incremental commit plan (create when the work is performed)
Use 40+ small meaningful changes over the build, in real order, without artificial dates or authors. English subjects:

```text
chore(repo): initialize reproducible Expo workspace
chore(ci): add typecheck and unit test workflow
chore(config): configure Android package and EAS profiles
docs(product): add English requirements and release gates
refactor(app): split feature modules and navigation
feat(theme): add Islamic Emerald light palette
feat(theme): add Midnight Navy dark palette
feat(settings): persist appearance mode
feat(i18n): add Arabic translations and RTL layout
feat(i18n): add English translations and LTR navigation
feat(onboarding): add guest welcome and privacy flow
feat(calendar): model 29 and 30 day Ramadan seasons
test(calendar): cover timezone and rollover boundaries
feat(tracker): add daily prayer check-ins
feat(tracker): add fasting status logging
feat(storage): persist records to SQLite
feat(goals): create and edit season goals
feat(habits): build daily task and habit cards
feat(home): connect today dashboard to stored records
refactor(quran): isolate KSU request helpers
feat(quran): render original KSU Mushaf page PNGs
feat(quran): add verse navigation and bookmarks
feat(quran): calculate KSU highlight overlays
feat(quran): support tapped ayah selection
feat(quran): play Husary verse MP3
feat(quran): show Saadi tafsir safely
test(quran): verify reference geometry and page boundaries
fix(quran): handle stale requests and unmounted audio
feat(khatmah): add reading session and plan model
feat(khatmah): implement catch-up scheduling
feat(auth): add optional sign-in and account migration
feat(backend): add user tables and RLS policies
test(backend): verify cross-user isolation
feat(sync): implement offline mutation outbox
feat(gamification): define XP rules and ledger
feat(gamification): add levels and achievements
test(gamification): prevent duplicate XP awards
feat(leaderboard): add opt-in ranking and aliases
feat(challenges): add group challenge participation
feat(privacy): implement board opt-out and deletion
feat(adhkar): add reviewed sources and counters
feat(notifications): implement opt-in reminders
feat(analytics): build transparent personal reports
feat(release): add internal APK preview pipeline
test(release): log real-device Android smoke results
fix(release): address beta crash and a11y findings
docs(release): prepare AAB and Play Store checklist
```

## Honest Git workflow
```bash
git init
git add .
git commit -m "chore(repo): import current Ramadan Journey baseline"
# then one real feature or fix at a time:
git checkout -b feature/RJ-003-theme
# ... edit code, run tests ...
git add .
git commit -m "feat(theme): add Islamic Emerald light palette"
# keep actual timestamps; do not set GIT_AUTHOR_DATE / GIT_COMMITTER_DATE artificially
```

Useful optional tags: `baseline-2026-10-22`, `apk-beta-v0.1`, `apk-beta-v0.2`. Tag only when the corresponding milestone actually exists.

## Status update format in Arabic (to user)
"أنجزت RJ-003: أضفت ثيم الوضع الفاتح مع الألوان المتفق عليها. الملفات المتأثرة: src/theme/... . اختبار التباين: نجح. اختبار على Android: لم يتم بعد. الـ Commit: 12ab34c (بتاريخ التنفيذ الحقيقي). التالي: RJ-004."
