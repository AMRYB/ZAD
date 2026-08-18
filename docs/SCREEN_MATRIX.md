# Actual screen matrix

| Route/state | Purpose | Storage/API |
|---|---|---|
| First-launch gate | Welcome, privacy, locale, theme | Local snapshot |
| `/` | Actual today totals and continue-reading | Local records |
| `/quran` | Original PNG, selection, audio, bookmarks | KSU + local selection/bookmarks |
| Quran picker: surah | Arabic or transliterated names, search | Captured KSU metadata |
| Quran picker: page | Validated 1–604 input | Captured KSU metadata |
| Quran picker: ayah | Chapter-specific bounds | Captured KSU metadata |
| Quran tafsir sheet and author picker | Five Arabic authors; safe source text | Allowlisted KSU tafsir endpoint |
| Quran reciter picker | Searchable Hafs catalogue, selection persists | Captured KSU mapping and original audio URLs |
| Quran reading settings | Full-page/fill-width, zoom/reset, immersive toggle | Local preferences + transient viewport state |
| Quran tools sheet | Bookmarks and explicit plan page confirmation | Local records |
| `/day` and `?date=` | Prayer/fasting, daily habits, private note | SQLite / browser adapter |
| `/progress` | Actual aggregates, personal goal counters | Local records |
| `/plans` | Independent page plans, explicit completion/undo | Local records |
| `/more` | Companions and journey feature grid | Real route links; optional account entry when configured |
| `/settings` | Appearance, locale, season, privacy, export/import | Local preferences and explicit backup adapter |
| `/setup` | Optional companions, city and reminders | Persisted personalization; no automatic Adhan activation |
| `/reports` | 7/30-day dated activity, totals and day links | Private recorded activity; no inferred historical dates |
| `/listening` | Persistent queue, controls, repeat and sleep timer | Original KSU audio and native media service |
| `/widget` | Native launcher pin and cache instructions | Android RemoteViews widget; no browser pin claim |
| `/account`, `/auth/callback` | Optional email PKCE, opt-in sync/import/conflict/archive/deletion | Private hosted Supabase, UUID local cache and secure session storage |
| `/adhan` | Saved city, today/tomorrow/week/date timetables, next prayer, permissions and five intro/voice previews with Friday override | ESA monthly source, private cache and native Android exact alarms |
| Adhan city sheet | Search 82 authoritative city options; freely resize/dismiss sheet | Captured ESA selectors and local preferences |
| `/achievements` | Personal XP/levels, twelve badges, filters, rules and corrected/recent allocations; reachable from Home and More | Private local participation ledger; no server/trusted XP writes |
| `/calendar` | Configured 29/30-day grid and day links | Local season + date-keyed records |

The original master plan's approximately 70 destinations refer to the full future product. They are not presented as 70 implemented screens. Optional sign-in has a functional route when configured. No leaderboard, challenges, Family or AI placeholder route is shown.

## Startup overlay 0.11

The root displays the original first nine seconds in silent cover mode without controls before revealing the intended route. Android system bars are hidden during the intro and restored afterward. It is not a new navigable screen. ESA sunrise/Isha branding changes launcher and large audio artwork independently of UI theme. See BRANDING_V0_11.md.

## Reader 0.3 interaction changes

The current reader uses two sideways-cycling control cards; its arrow-free navigation face contains aligned surah, ayah and enlarged page pickers. Immersive mode centers playback between ayah on the right and text-only tafsir on the left. Original page overlays live on a pinch/pan transform plane. Horizontal page swipes apply at normal size. See `ADHAN_VERIFICATION.md` for the current revision and earlier reader reports for gesture history and tested limits.
