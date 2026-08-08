# Tasbih, Adhkar and Good Deeds — 0.8.0

## Scope and navigation

The Quran reader and ESA Adhan remain the existing modules. Tasbih is the next bottom tab after Quran. More contains Adhkar and Good Deeds. All new UI labels, errors and notification bodies have Arabic/English variants and follow the existing light/dark palettes. Traditional Arabic recitation text remains Arabic in either interface language; no generated devotional translation or hadith grading is supplied.

Tasbih renders a native-view bead loop with a short per-count animation. Tap or deliberate downward pull adds one count. Reduced-motion preferences stop the animation. A saved switch controls `expo-haptics` Light feedback. The new normal Android `VIBRATE` permission supports that explicitly requested behavior; no microphone, location or storage access was added. Counters are independent for each phrase. Users choose a personal round goal, undo a tap, or confirm a counter reset while retaining daily totals and other counters.

Good Deeds starts with no selected goals. It offers the eight requested suggestions and custom private titles. Daily completion is reversible; weekly totals are plain recorded-act counts. Deselection does not erase history. Removing a custom choice archives its title/ID so earlier records still restore safely. Nothing awards XP or changes a public ranking.

## Adhkar content provenance

Source selected by the user: [Hisn al-Muslim on Risala](https://risala.prh.gov.sa/ar/content/51), by Said ibn Ali ibn Wahf Al-Qahtani. Captured public HTML SHA256: `091d5bd6a65e87b0e448347aa47d6057024418fc0e83f6bea7a8bfcf19e46341` on 2026-10-24. `scripts/build-risala-catalogue.py` accepts the saved public HTML, checks its structure and extracts traditional devotional wordings and factual citations. It performs no runtime scraping. The raw HTML is not published.

The catalogue contains **90 unique entries**, reused across six sections:

| Section | Displayed entries |
|---|---:|
| Morning | 24 |
| Evening | 22 |
| Before sleep | 15 |
| Upon waking | 4 |
| After prayer | 12 for Fajr/general; prayer-specific entries are filtered for other prayers |
| Daily situations | 29 selected entries |

This is a selected six-section reader, not a claim to reproduce every chapter of Hisn al-Muslim. Original HTML note markers are removed from the reading text and exposed as source-note numbers with bibliographic references and a source link. Each entry pins its source paragraphs and a source-text hash. Evening alternatives follow the edition's explicit notes (98/99, 101, 105, 107, 116/117, 119), rather than a generated rewrite. Compound 33/33/34 bedtime counts and the after-prayer counts are split into individual counters. The daily istighfar entry uses one counter shared across sections.

If the passage states no repetition number, the UI explicitly labels one reading as a tracking choice. It does not present an invented prescribed count. The source's truncated clothing passage is excluded rather than completed from memory. The bedtime instruction to read As-Sajdah and Al-Mulk opens the complete original KSU Mushaf at those surahs. The separate Quran screen still fetches only original KSU content; ESA remains the sole prayer-time source. No publisher cover/layout or alternate Quran provider was added.

Each entry shows its complete included text without line truncation, repetitions, source and count button. Favorites, text size and last entry are saved. Progress is separated by local date and section; after-prayer sessions are also separated by prayer. Source-pinned limits, known IDs and session membership are validated on actions and backup restore. Shared daily counts avoid double counting across morning/evening sections.

## Optional local reminders

Adhkar and Good Deeds reminders have separate opt-ins, both off for existing and new users. Suggested local-clock times are editable: morning/evening/sleep at 07:00/18:00/22:00, and good deeds at 09:00/15:00/20:00. Three distinct valid `HH:mm` values are required per group. Good Deeds reminders require at least one selected goal. Private custom titles are never copied into notifications or a network payload.

The existing local Android module schedules at most six next-occurrence personal alarms using `setAndAllowWhileIdle`; these are inexact personal reminders and can be deferred by Android. They are independent of the exact ESA prayer alarms. Delivery reschedules only the delivered slot so another due reminder is not lost. Existing boot/package/time/timezone restoration replans the saved choices. Immutable PendingIntents and a non-exported receiver enforce the six known destinations. Generation and planned-time checks reject stale deliveries; delivered timestamps prevent duplicates. Disabling cancels pending personal alarms. These reminders have their own notification category and need notification permission, without requiring the Adhan switch to be enabled.

The optional test schedules a selected enabled group's notification after 15 seconds, using exact access only if it is already available. It does not alter the real timetable or imply an actual daily prayer event.

## Verification evidence

- Typecheck and lint passed; 53 TypeScript tests passed, covering migration, persistence, bounded counters, six source sections, evening/prayer variants, shared daily counts, custom archival and opt-in reminders.
- Native JUnit: 20 passing tests (six ESA, five Adhan sequence/date, four prayer-reminder policy and five personal-reminder clock/route tests).
- Browser 390px Tasbih: bead rendering, tap, one deliberate pull, undo and reload persistence passed. Synthetic count changes were undone after capturing the demo screenshot.
- Browser Adhkar: full waking text and source, completion cap, star/unstar, previous/next and last-position reopening passed. Synthetic count/favorite changes were undone after the demo capture.
- Isolated Android 16 personal-reminder APK: six slots, restore planning, actual accelerated AlarmManager deliveries for Adhkar/Good Deeds with opening actions, duplicate suppression, stable reconfiguration, English body/title, cancellation and stale-generation rejection passed. The prayer configuration was unchanged. Screen was non-interactive at the final sample, not a continuous external screen-state or acoustic measurement. The harness waits for Android's asynchronous notification updates/cancellations.
- Product APK signature/assets/source comparisons, current Good Deeds/browser results and installation status are maintained in the current release record after execution. Hardware perception of the new haptic effect is not asserted by browser tests.

The dependency lock retains the existing five SDK 58 patch advisories. An audit also reports five high-severity package findings in the Expo/CLI code-signing dependency chain (`expo`, `@expo/cli`, `@expo/code-signing-certificates`, `node-forge`, `zod`); no broad or forced SDK migration was made as part of this feature. New `expo-haptics` is not one of the reported packages. This private preview is not a public/Play release.

References: [Expo SDK 58 Haptics](https://docs.expo.dev/versions/v58.0.0/sdk/haptics/), [Android AlarmManager](https://developer.android.com/reference/android/app/AlarmManager), [Risala source edition](https://risala.prh.gov.sa/ar/content/51).
