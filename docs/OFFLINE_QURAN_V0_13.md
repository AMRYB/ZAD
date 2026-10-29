# Offline Quran downloads — 0.13.0

More → Settings now offers three independent entries: Mushaf pages, a selected reciter, and a selected tafsir. The download screen supports a page range or one/ all surahs, measured saved bytes, progress, pause, resume, confirmed removal and opening the downloaded selection in the reader.

## Content and storage contract

- KSU remains the exclusive network source. Existing verified URL builders and the reciter/tafsir catalogues determine every resource; the web relay rejects other URLs, credentials and redirects.
- A complete Mushaf plan has 1,208 resources: 604 original PNGs and 604 highlight JSON files. A complete reciter or tafsir plan has 6,236 resources. Complete plans are supported but were **not downloaded during verification**.
- Native Android stores content in private document files and an independent SQLite index, `zad-quran-offline-v1.db`. The browser uses IndexedDB blobs. Journey records, account snapshots and their schema are unchanged; Quran files are excluded from journey/cloud backups.
- Content must pass PNG completion, MP3 frame, highlight structure or nonempty tafsir checks before registration. Files are written to a temporary path and moved before the index is updated. Native storage reserves 5 MB; individual binary responses are capped at 32 MB and text at 512 KB.
- Downloads start only after an explicit action. One foreground worker starts at most one request per second. Backgrounding pauses it; reopening never starts a full download automatically. Resume skips indexed files, startup filters missing files, and deletion retains resources shared by another job.
- The reader resolves local page images, highlights, audio and raw tafsir before its existing online path. Original PNG bytes remain unchanged. Tafsir still passes through the safe plain-text parser. Existing recitation preparation/cancellation guards remain active for local sources.

Full reciter downloads may need substantial storage and hours of foreground operation. The UI recommends Wi-Fi and keeping the app open. This version does not claim an Android background download service or offline ESA timetable expansion.

## Executed verification

- Ten dedicated domain tests cover complete plans/catalogues, malformed content, persistence, network-free reads with a rejecting fetcher, interruption/resume, quota, concurrency, shared deletion, missing files, pacing and pausing just after the final file. The complete TypeScript suite passes 95 tests.
- Actual bounded browser downloads: page602 PNG/highlights, Husary surah108 (three MP3s), and Ibn Katheer surah108 (three tafsir responses): **8 files, 267.7 KB**. All remained complete after full reload and after reopening the preview on a later day.
- The reader displayed page602 from a `blob:` URL with ayah overlays, opened the saved Ibn Katheer tafsir for108:1, and advanced its Husary playback counter from0:00 to0:08. The original observed106:1 selection, source preferences and stopped playback were restored.
- No full Quran transfer, device airplane-mode test, native filesystem integration on a phone, or background downloader is claimed. Browser cached integration and domain no-network tests are distinct evidence.
- During UI verification a final-file pause race was found and repaired: a fully indexed job now ends as complete, while incomplete jobs always offer Resume.

Implementation: `src/core/offline-quran.ts`, `src/services/offline-store*`, `src/services/quran-downloads.ts`, `src/screens/Downloads.tsx`, and `src/state/OfflineDownloadCoordinator.tsx`. API references reviewed: [Expo58 FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/) and [Expo58 SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/).
