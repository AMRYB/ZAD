# Personal XP, levels and achievements — 0.9.0

## Delivery boundary

The requested XP/Levels/Achievements slice runs offline in the private app, without an account. It uses a **personal local ledger**, not the trusted Supabase `xp_events` balance or `get_leaderboard()` projection. No authentication, cloud sync, leaderboard, challenges or public reward economy is introduced. Never upload local totals as trusted server awards when adding accounts. Server-authorized reconciliation remains a separate release gate.

These are participation counters, never religious merit or proof of worship. Excused/skipped prayer and fasting records are eligible for the same first daily check-in as any other recorded status. Notes, reasons, navigation, passive image viewing, audio playback and reminder settings earn nothing.

## Version 1 rules

| Qualifying transition | XP | Category daily cap | Stable identity |
|---|---:|---:|---|
| First recorded prayer/fasting status | 5 | 5 | Activity date |
| Explicitly mark a reading-plan page read | 10 | 30 | Plan ID + page; once for that plan/page across days |
| Mark a habit for the day | 5 | 15 | Habit ID + activity date |
| Reach a personal goal target | 10 | 20 | Goal ID; once across days |
| Reach 33 daily Tasbih counts | 10 | 10 | Activity date; independent of adjustable round targets |
| Complete all entries/repetitions in an Adhkar section | 10 | 20 | Activity date + section; after-prayer section once per day |
| Record a selected Good Deed | 5 | 15 | Choice ID + activity date |

Combined cap: **100 XP per device-local calendar date**. The final allocation may be partial. Entries after a cap have a zero-point allocation; their valid participation can still advance badges. Different independent reading plans have different source identities.

Only a new qualifying transition on today's device-local date creates an allocation. Editing past/future dated daily records does not mint points. Undated plan/goal actions use the date of explicit confirmation. There is no historical backfill. A restored old allocation retains its original date.

Undo lowers active XP. Redo reinstates the **same allocation**, without moving it to another day. Original allocations remain reserved against that day's caps after undo. Removing goals/plans/habits revokes their eligible allocations. Deselection/archive of Good Deeds preserves recorded history; explicitly unmarking an act revokes its allocation. Resetting a Tasbih phrase retains daily participation under the existing counter contract. Adhkar reset/replay reverses/reinstates its reward, including shared daily entries.

Source updates and ledger reconciliation happen together in `model.reducer`, saved in the existing atomic snapshot. No effect/render/network retry awards points. The ledger stores kind, opaque source identity, date, rule allocation and active state; never private note/title content.

## Levels and badges

Level 1 starts at zero. Reaching level `n` requires `50 * n * (n - 1)` active XP; advancing from level `n` costs `100 * n`. Levels are derived rather than separately mutable.

Twelve badges: first participation; 3/7/30 different participation days; a 3-day sequence; 1/10 reading-plan pages; 7 habit check-ins; first completed goal; Tasbih on 3 days; 3 completed Adhkar sections; 5 Good Deeds check-ins. Eligibility, progress and first qualifying calendar date are derived from active ledger entries, with stable badge IDs. No extra badge XP or duplicate unlock effects. Correcting records can relock a badge and reduce its level. Badge dates represent eligible participation dates, not precise timestamps.

## Migration and privacy

Snapshot version 1, SQLite filename and browser storage key stay the same. A missing `gamification` property initializes empty; existing fields remain intact. New ledgers validate rule version, dates, source uniqueness, fields, allocation order and category/global caps. Invalid data fails closed through the current retry/import UI. Export/import includes active and inactive allocations, preserving undo/redo identity.

This local ledger is not tamper-proof: backup/device-clock editing, reinstalling or multiple devices cannot provide server-grade anti-cheat or conflict resolution. Never trust it for a future public board. Old backups cannot reconstruct later awards. No telemetry, notification or external request is added.

## Verification log

- Core: 66 TypeScript tests PASS (12 new), including inclusive check-ins, no passive rewards, undo/replay, category/global caps, partial/zero allocations, old snapshot migration, malformed ledger rejection, 100 level boundaries, Tasbih target/reset, full Adhkar completion/reset, source deletion and deterministic badge dates/streak corrections.
- Typecheck/lint PASS after adding the new UI.
- UI/device/release evidence will be added after execution; core results do not imply APK/device acceptance.

### UI evidence

Browser flow PASS: More → My achievements, a pre-existing synthetic QA habit check-in → 5 XP + First step badge; reload preserved both; undo → 0 XP + badge relock; redo → the same 5 XP without duplication. The QA habit was unmarked afterward and original Arabic/light preferences restored. Earned badge filtering and expanded rules rendered correctly. Arabic/light at 320px and English/dark at 390px had zero DOM elements outside horizontal viewport bounds. Both 390px layouts and badge cards were visually inspected; browser error logs were empty. Raw screenshots use synthetic participation, not the user's worship records. React review: calculations derived with memoized ledger dependencies, no reward effects, fixed hooks, accessible controls/progress, theme tokens and explicit RTL/LTR retained.

Production web export PASS with `/achievements` and the three existing allowlisted API routes. No new API is needed for local participation.

Additional scenarios PASS: all twelve badges unlocked through reducer transitions over thirty calendar days across October/November, and shared daily Adhkar reset/replay revokes/restores the affected morning-section reward without duplication.

### Build evidence

Private arm64 0.9.0/code 12 build PASS in 10m 30s. The artifact passes signature/manifest, 129 source/asset comparisons, 23 compiled-source comparisons, exact font/twelve recording checks and native/harness checks. All twenty native parser/policy tests were rerun and passed. No new permissions/dependencies. After ADB reconnection, install -r over 0.8.0 and COLD startup into achievements PASS on Android 16. App top-resumed/alive with no own-process runtime errors; notification/exact-alarm/vibration access retained. Native XP interaction and old-record integrity user confirmation are pending. The previous installed 0.8.0 release evidence is archived unchanged. Prior Doctor/audit advisories are retained without claiming a rerun.
