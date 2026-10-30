# Written recall — 0.15.0

## Scope

The owner explicitly requested typed Quran recall using an official Saudi source, with no voice feature. More → Written recall selects a surah and inclusive ayah range. The reference is hidden initially. Each step accepts one ayah, reviews its words/letters, shows the original reference, and advances through the range. A hint marks subsequent attempts on that ayah as assisted. This is a spelling comparison, not certification of memorization, pronunciation or tajweed. It awards no XP.

## Official source and integrity

- Publisher: King Fahd Glorious Quran Printing Complex, Saudi Arabia.
- Current official developer resource page: https://qurancomplex.gov.sa/quran-dev/
- Original Hafs archive: https://download.qurancomplex.gov.sa/resources_dev/kfgqpc_hafs_v30.zip
- The page describes the resources as available for application/software development. Published update 15.0, dated 2026-09-30; the archive/internal filenames use v30. These identifiers are recorded separately.
- Published archive SHA256: `227e6b1564d980f2bd09c2c35ebfb0330ac268c79a7c247cd1ab665bc635f245`. The single downloaded archive matched exactly using normal TLS certificate validation.
- JSON SHA256: `d7adf8aeeef5a7b6798060706a55735dffbcdb542b290a3907bd9f70c498f4d3`.
- TTF SHA256: `9ccd82324319bfe9e57efd34c830770ce86655f01661ca06b50e3b0c20073c57`.
- Original JSON and font bytes are retained unchanged in `assets/quran-reference/`. All 6,236 rows and 114 surah counts/ayah numbering are validated against existing navigation metadata. The full source manifest is `src/data/recall-source.json`.
- Reproducible import: `python scripts/import-official-recall.py --archive <original-zip>`. The importer rejects any archive whose published hash differs, validates rows, and extracts only the two pinned entries.

The source page's developer availability is the basis for this scoped use. The archive contains no separate license/readme. Do not invent a broad copyright waiver or apply the separate vector-edition rights page to these Unicode files. Official source material does not mean ministry endorsement, app certification or an official government application. The UI links the actual source and says so. Existing KSU reader PNG/audio/tafsir/highlights and ESA timetables remain unchanged; this is the documented user-authorized source exception for written recall only.

## Comparison rules

`src/core/written-recall.ts` normalizes a separate comparison copy using NFKC then NFC, strips Arabic vocalization/Quran annotation marks, maps alif-wasla to plain alif, removes tatweel/bidi controls, and splits punctuation/whitespace. It preserves hamza distinctions, ta marbuta versus ha, and alif maqsura versus ya. Latin letters remain differences. Punctuation/digits and optional diacritics are not graded.

Word-level edit alignment is run against the two original official fields independently: `aya_text_emlaey` and `aya_text_unicode`. The lower-distance result is selected, with ordinary spelling preferred on ties. This accepts either complete official orthography; arbitrary mixtures of orthographic conventions are not guaranteed equivalent. Changed words receive a second, character-level alignment. Missing/extra/replaced letters and missing/extra words are labeled, not identified by color alone. Counts are comparison differences, not a linguistic or tajweed score. Uthmanic reference display uses the exact supplied Hafs font, with an explicit font-loading error rather than silently substituting artwork.

Limits: one ayah per step, 6,000 input characters and 300 words. All 6,236 ayahs pass self-comparison in both source spellings. Empty/no-letter input cannot be submitted. No spelling auto-correction, generated Quran text, microphone, speech recognition, Tarteel request or online comparison endpoint is involved. The bundled corpus/font work offline after installation.

## State and privacy

The typed answer and comparison detail exist only in screen memory. The persisted `recall` field contains the last range/current ayah/completion flag and up to 100 summaries: id/date/surah/ayah, matched/total words, letter differences, missing/extra words and whether a hint was shown. Attempt validation rejects unknown fields, preventing accidental answer-text persistence. Duplicate IDs are ignored; a summary must match the active ayah. Prior version-1 snapshots migrate by adding an empty recall state; unrelated records and the reader's `lastRead` are preserved.

Summaries and position are excluded from optional Supabase cloud documents and preserved locally when applying a cloud snapshot. Explicit existing guest-to-account import merges summaries once and keeps bounded history. A user-initiated full local export includes summaries, as the UI explains for local backup; it never contains the typed answer. Opening the public source link is the only external action on this page.

## Verification

Eight new domain/integration tests cover pinned bytes and full numbering, both spellings across the corpus, normalization, real letter errors, edit alignment/limits, old-state migration, bounded/idempotent summaries/no XP and cloud exclusion/guest merge. Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build:web`. Device/build/UI evidence is recorded separately in QA_REPORT.md and ANDROID_APK_RELEASE.md; source correctness tests do not replace human review of Arabic rendering or establish recitation accuracy.
