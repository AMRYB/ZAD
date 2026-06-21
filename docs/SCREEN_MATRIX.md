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
| `/more` | Locale/theme, season setup, JSON export/import confirmation, source credits | Local preferences / native file/share adapter or browser file adapter |
| `/calendar` | Configured 29/30-day grid and day links | Local season + date-keyed records |

The original master plan's approximately 70 destinations refer to the full future product. They are not presented as 70 implemented screens. No sign-in, leaderboard, challenges, Family or AI placeholder route is shown.
