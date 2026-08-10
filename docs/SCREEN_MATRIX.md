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
| `/more` | Adhan entry, locale/theme, season setup, JSON export/import confirmation, privacy/about | Local preferences / native file/share adapter or browser file adapter |
| `/adhan` | Saved city, today/tomorrow/week/date timetables, next prayer, permissions and five intro/voice previews with Friday override | ESA monthly source, private cache and native Android exact alarms |
| Adhan city sheet | Search 82 authoritative city options; freely resize/dismiss sheet | Captured ESA selectors and local preferences |
| `/achievements` | Personal XP/levels, twelve badges, filters, rules and corrected/recent allocations; reachable from Home and More | Private local participation ledger; no server/trusted XP writes |
| `/calendar` | Configured 29/30-day grid and day links | Local season + date-keyed records |

The original master plan's approximately 70 destinations refer to the full future product. They are not presented as 70 implemented screens. No sign-in, leaderboard, challenges, Family or AI placeholder route is shown.

## Reader 0.3 interaction changes

The current reader uses two sideways-cycling control cards; its arrow-free navigation face contains aligned surah, ayah and enlarged page pickers. Immersive mode centers playback between ayah on the right and text-only tafsir on the left. Original page overlays live on a pinch/pan transform plane. Horizontal page swipes apply at normal size. See `ADHAN_VERIFICATION.md` for the current revision and earlier reader reports for gesture history and tested limits.
