# ZAD data flow map — 0.12.0 private beta

| Data | Default location | Optional destination and trigger |
|---|---|---|
| Prayer/fasting records, private notes, goals/habits, reading plans/bookmarks, devotional progress and personal XP | Guest SQLite snapshot or browser origin storage | Private Supabase snapshot only after account sign-in and explicit sync consent |
| Existing guest records | Separate guest snapshot | Explicit guest-import confirmation; both original copies archived locally |
| Account cache, queued changes and conflict copies | UUID-namespaced local profile storage | Only the current snapshot syncs; archives and guest-import receipt remain local |
| Email identity/session | Supabase Auth; native session encrypted through Expo SecureStore, web sessionStorage | User-initiated PKCE email login/refresh; never a State/export/log field |
| Appearance, reader settings, city/Adhan controls, reminders and haptics | Device-local settings | Normalized/excluded from effective cloud restore; remote records cannot grant device permissions |
| Requested Quran page/audio/tafsir | Original KSU content endpoints; fixed-source web relay for browser CORS | Only requested reading/playback content; no alternate provider, bulk corpus scan or analytics |
| Manual prayer city/month | ESA monthly timetable request and bounded app cache | Original ESA service; no GPS/precise location permission or alternate calculation |
| Widget | Minimal city/language/theme/last-reading preferences and existing ESA cache | Own Android launcher; no separate network fetch or account session/token |
| Timed branding | Device-local city/language/variant and ESA cache | Bounded ESA refresh; launcher/own notification artwork, no account records or GPS |
| Startup video | Bundled nine-second MP4 with no audio stream | Local playback only; no network, background audio or media notification |
| Reminder notifications | Native Android schedule | Generic encouragement; no private note/deed-title payload |
| Export file | User-initiated active snapshot or selected local archive | User chooses the file/share destination; it can contain private notes |

No advertising/analytics SDK, microphone, external storage, overlay or biometric permission is enabled. Vibration is optional Tasbih feedback. Notification/exact-alarm access is requested through the existing opt-in Adhan/reminder flow. Android automatic backup is disabled. Local SQLite is sandboxed but is not claimed to use SQLCipher.

Cloud records are private by default and protected by own-user RLS/CAS RPCs. Personal snapshot XP is not trusted server XP. No public leaderboard/social feed is activated. The account screen confirms cloud deletion; it explicitly states that local caches/archives and the guest profile remain on the phone. Removing the app can remove local records. Export first when desired.

KSU, ESA and Supabase receive ordinary service requests, including network-level information required to answer them. This app does not assert those operators' retention rules. Production publication requires an owner-reviewed policy, retention/contact details and source agreements; see RELEASE_READINESS.md.

Tasbih0.12 changes presentation and local gesture handling only. Beads are rendered in code without an external image host. Counter, phrase, goal and haptic settings retain the existing storage/sync boundaries; no new device permission or telemetry was added.
