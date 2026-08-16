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

The user signed into Supabase and created a separate ZAD project on their Free organization. The existing `20261023000100_private_core.sql` was manually run in that project's SQL editor: Success, no rows returned. This is not a claim that Supabase CLI migration history was populated. No unrelated project was edited, no database password or service-role key was read, and public client settings were saved only in ignored `.env.local`. The Site URL is http://localhost:8082. The redirect allowlist contains exactly ramadanjourney://auth/callback and http://localhost:8082/auth/callback, with no wildcard. These settings were saved and read back from the dashboard.

Default Supabase email templates/settings are used; template editing currently requires custom SMTP in this dashboard. The app therefore uses secure PKCE email links rather than promising a numeric code absent from the default message. Public rollout needs a verified sender/SMTP and production callback origin; no purchase/domain/subscription was made.

## Verification progress

- 81 TypeScript tests PASS: existing baseline plus date-aware Home/report/personalization migration, original KSU queue bounds/sleep options, per-account storage/outbox/restart/conflicts/late-ack/guest dedup/caps, immutable HTTP identity and callback allowlist tests.
- Typecheck/direct full lint PASS after the final changes; Expo Doctor 20/20 after compatible SDK patches. A cached lint process stalled and was stopped; a clean full lint and provider check passed.
- Browser setup/search/personalization persistence, real ESA Home countdown, synthetic habit-to-report 7/30-day totals, optional-account validation, Arabic/light 390px and English/dark 320px with zero horizontal overflow, KSU audio continuing across navigation and native-style queue advancing through ayahs, repeat and timer set/cancel PASS. Home/More screenshots are local QA artifacts. The web widget route correctly explains its Android-only pin action.
- Actual Android 16 first 0.10.0 install/cold launch PASS without uninstall/data clearing. User confirmed email link login, explicit guest import/private sync completion and retained records. This confirms an owner beta flow, not unrestricted public email delivery.
- 22 native unit tests PASS. Five isolated Android checks PASS: timer schedule/cancel, stale timer versus replacement, invalid timer durations, real widget registration/layout inflation and attached small/large notification artwork. These checks use the separate harness package, not private app records.
- User reported external-player 0:00 duration and missing artwork; they chose accurate per-ayah duration plus ayah number/total, without scanning all surah audio. Added native item-title/duration refresh and ZAD small/large notification artwork. A version/hash-guarded Expo Audio 58.0.10 config plugin makes this reproducible and refuses unknown upstream changes. Final source-built patch was verified in the APK and installed; the user confirmed the repaired audio and notification.
- The user confirmed the home-screen widget appeared and Isha's final cutoff is correct. The first revised media build then showed a start failure on the phone. Startup no longer waits for an Asset image operation or passes its URL into media controls; Android loads the already-packaged brand drawable directly. The user confirmed the repaired audio plays and its notification is correct. The app-owned media service was observed in foreground; no own-process runtime errors were observed. See ADHAN_AUDIO_V0_6.md for verified sample-exact trimming.


## Hosted authorization evidence

`supabase/tests/privacy-smoke.sql` was executed against the new hosted project using two synthetic example.invalid identities inside one rolled-back transaction. Actual authenticated roles passed own-user RLS, rejected cross-user reads/inserts and direct revision writes, rejected stale CAS revisions, deduplicated XP replay, retained private board defaults, and limited deletion to the requesting identity. The transaction was rolled back; no synthetic account/record remains. Anonymous REST snapshot reads and sync_state calls each returned 401. Proof files are local ignored QA artifacts, with no tokens or private user records. This verifies real database authorization; it does not replace actual PKCE email login and mobile sync testing.


## Final delivery

Verified 0.10.0/code 13 private APK: 44,904,584 bytes, SHA256 8d9c06407a40e2f2e1a9efad06c9f29f8691ff3d016826f77a0b2667e5d4715f. Input comparison 178 / critical compiled sources 44, existing signer, all 12 recordings and final native media patch PASS. Installed without clearing ZAD data. The user confirmed cloud login/import/sync, retained records, launcher widget, Isha cutoff and repaired recitation/notification appearance. See ANDROID_APK_RELEASE.md and BUILD_METADATA.json for evidence scope and the external production gates.
