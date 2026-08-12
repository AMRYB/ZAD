# Connected daily journey — 0.10.0

## Requested scope and baseline

Preserve the installed/user-accepted 0.9.0 baseline. Implement a personalized daily Home, a separate More grid and Settings, 7/30-day reports, optional setup, persistent/background recitation with a sleep timer, Android home-screen widget, and optional accounts/private cloud sync. Prepare release/privacy/accessibility evidence. Shared leaderboards/challenges and bulk Quran offline downloads are not silently activated by this work; their server/privacy and source-permission gates remain separate.

## Implementation boundaries

- Existing snapshot version/database filename/browser guest key retained. Missing personalization migrates to all companion cards without inventing XP or reading dates. Existing guest records stay separate from each UUID-namespaced account cache.
- Home reuses authoritative ESA monthly requests/cache, including tomorrow across month boundaries. No location permission or alternate prayer calculation. More links to real feature pages; Settings has its own route.
- Reports use dated records for prayer/fasting/habits/deeds/Tasbih/Adhkar and active dated reading-plan events from 0.9.0 onward. Older undated pages are not assigned invented dates. Excused/not-completed records still count as recorded participation days.
- Personalization selects visible companion cards, manual ESA city and optional reminder controls. Other features remain available. Existing users are not forced through onboarding again.
- Recitation is owned above navigation. An Expo native playlist contains original KSU ayah URLs from the selected ayah through its surah end. Only user-started playback loads audio; queue construction is not a bulk download. Native queue advancement/repeat and lock-screen controls do not depend on a mounted Quran screen. Device restore ends the old recitation session. Sleep pauses only ZAD's existing Expo media service, never a global media key; exact-alarm denial is shown as approximate timing.
- Widget is a real AppWidgetProvider/RemoteViews implementation. It reads only cached ESA months, schedules its next refresh, follows ZAD's appearance/language and opens Adhan, the last reading position or Tasbih. It never fetches an alternate timetable or starts audio at boot.
- Cloud Auth uses public client configuration in ignored `.env.local`, PKCE email links and secure native token storage. Native SHA-256/CSPRNG use Expo Crypto; no plain PKCE fallback is intended. Web preview sessions use sessionStorage. Tokens/credentials do not enter snapshots, logs or public Git.
- Cloud sync is explicit opt-in. A durable UUID-specific full-document outbox coalesces changes. Server CAS revisions detect competing edits. Missed acknowledgements are recognized by the saved document. Remote data never silently replaces local records. User-directed conflict resolution archives the other full copy locally; guest import archives both originals and deduplicates stable IDs/XP sources. Device alarms/permissions/appearance/reciter settings remain local. Local XP is never imported as trusted server XP.
- Signed-out guest/account namespaces are separate. Previous account data can be read offline on the same device; explicit sign-out returns to the guest cache. Every data request captures its actor/token so a delayed operation cannot write or delete the next signed-in account.

## Hosted setup actually executed

The user signed into Supabase and created a separate ZAD project on their Free organization. The existing `20261023000100_private_core.sql` was manually run in that project's SQL editor: Success, no rows returned. This is not a claim that Supabase CLI migration history was populated. No unrelated project was edited, no database password or service-role key was read, and public client settings were saved only in ignored `.env.local`. Narrow callback allowlist and live authorization checks are recorded below after confirmation.

Default Supabase email templates/settings are used; template editing currently requires custom SMTP in this dashboard. The app therefore uses secure PKCE email links rather than promising a numeric code absent from the default message. Public rollout needs a verified sender/SMTP and production callback origin; no purchase/domain/subscription was made.

## Verification progress

- 80 TypeScript tests PASS: existing baseline plus date-aware Home/report/personalization migration, original KSU queue bounds/sleep options, per-account storage/outbox/restart/conflicts/late-ack/guest dedup/caps, immutable HTTP identity and callback allowlist tests.
- Typecheck/lint PASS before the final PKCE crypto additions; rerun on the final source before release.
- Browser UI, native widget/audio build/device testing, actual email sign-in/sync and the new Isha end-trim listening check remain pending. See `ADHAN_AUDIO_V0_6.md` for verified 57-second sample-exact trimming.
