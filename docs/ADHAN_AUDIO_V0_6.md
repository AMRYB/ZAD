# Prayer-specific Adhan sequences — 0.6.0

## Requested behavior

At each existing ESA prayer alarm, play that prayer's MBC intro and then the selected Adhan, sequentially. The alarm timestamp is unchanged: the intro starts at ESA time; the Adhan follows about 10–11 seconds later. The ten-minute reminder remains relative to ESA time. This does not create an additional Friday alarm or estimate the time of a mosque's sermon/second call.

| Prayer | Normal recording | Intro |
|---|---|---|
| Fajr | Nasr El-Din Tobar, separate Fajr recording | User-selected MBC Masr 2 Fajr clip |
| Dhuhr, Saturday–Thursday | Abul Enein Shuaisha | User-selected MBC Masr 2 Dhuhr clip |
| Asr | Mahmoud Khalil Al-Husary | User-selected MBC Masr 2 Asr clip |
| Maghrib | Mohamed Rifaat | User-selected MBC Masr 2 Maghrib clip |
| Isha | Nasr El-Din Tobar, separate Isha recording | User-selected MBC Masr 2 Isha clip |
| Friday Dhuhr only | User-selected official Al-Azhar recording | User-selected MBC Masr Friday clip |

The saved **Cairo event date** determines Friday, independently of the phone's timezone or the date when a cached alarm was prepared. Previewing a Friday timetable uses Friday audio. Fajr and Isha are distinct files; the Fajr recording is never reused for Isha. Sunrise is excluded. Unsupported prayer names, dates and clip IDs fail closed.

The user's ordinary-intro reference was [this playlist](https://www.youtube.com/watch?v=KTPAoW-gSyo&list=PL6AwjOquwjpTHsQrAQnqsHsWfgMRUT9Oc). Only its first five Egyptian prayer clips are selected; later Iraq entries are not used. The user separately supplied the Friday intro and Al-Azhar links below.

## Source inventory and measured files

The checked-in `src/data/adhan-audio.json` is the shared source/sequence catalogue. It records every full SHA-256, file size, decoded duration, source title and uploader. The uploader's title identifies the Tobar recordings; this is not a claim of independently established archival authenticity or an official broadcaster feed. Al-Azhar's source channel was visibly verified in the browser as `@OfficialAzharEG`.

| Clip ID | Source | Uploader / publisher | MP3 seconds | Bytes |
|---|---|---|---|---|
| `intro-fajr` | [Source](https://www.youtube.com/watch?v=KTPAoW-gSyo) | CN APPLEJACK | 10.937 | 132014 |
| `intro-dhuhr` | [Source](https://www.youtube.com/watch?v=pZtoj-X0Sec) | CN APPLEJACK | 10.913 | 131701 |
| `intro-asr` | [Source](https://www.youtube.com/watch?v=7U0paamyfeU) | CN APPLEJACK | 10.913 | 131701 |
| `intro-maghrib` | [Source](https://www.youtube.com/watch?v=6fCjW6uuyDg) | CN APPLEJACK | 10.913 | 131701 |
| `intro-isha` | [Source](https://www.youtube.com/watch?v=jBI7eJ8rObU) | CN APPLEJACK | 10.937 | 132014 |
| `intro-friday` | [Source](https://www.youtube.com/watch?v=H6X_oDODWZU) | Fahad_1000 | 10.054 | 121356 |
| `tobar-fajr` | [Source](https://www.youtube.com/watch?v=zzu2MUktkbs) | Hassan Shokeir | 288.369 | 3461373 |
| `tobar-isha` | [Source](https://www.youtube.com/watch?v=czWeeCXe0zM) | روائع إذاعة القرآن RadioQuran | 323.431 | 3882048 |
| `azhar-friday` | [Source](https://www.youtube.com/watch?v=cD3mXVGD4iI) | Al-Azhar Al-Shareef | 198.182 | 2378963 |
| `shuaisha` | [Source](https://audio.islamweb.net/audio/index.php?audioid=122662&page=audioinfo) | Islamweb | 236.548 | 473216 |
| `husary` | [Source](https://audio.islamweb.net/audio/index.php?audioid=122667&page=audioinfo) | Islamweb | 127.504 | 256128 |
| `rifaat` | [Source](https://audio.islamweb.net/audio/index.php?audioid=122665&page=audioinfo) | Islamweb | 203.716 | 407680 |

The three Islamweb files were fetched using their actual publisher `contentUrl` and public publisher Referer, returned HTTP 200 and decoded as MP3. Their original bytes were retained. YouTube recordings were read from the specific public videos, selecting audio only, and converted to MP3 at 96 kbit/s using yt-dlp 2026.08.19 and FFmpeg N-125875-g5d4d3bdc61-20260731. No clip was shortened, remixed, pitch-shifted or replaced with synthetic speech. `ffprobe` confirmed all twelve complete files decode. Uploader metadata is not copied into public logs; signed delivery URLs and response tokens are not stored in the catalogue.

## Private assets and reproducibility

Prepared MP3s are local under ignored `assets/private/adhan/<clip-id>.mp3`. The private Android build includes those twelve files under `assets/zad-adhan/`, plus the public catalogue. The module verifies each file's exact size/hash before copying it to private app storage. Playback then works without a network connection. This supersedes 0.5.0's single remote Rifaat download.

The public repository contains source, provenance, hashes and tests, **not the recordings**. Public availability is not a redistribution-license claim; these copies are for the user's private preview. A clean public checkout without matching local media reports an audio-preparation error, rather than playing a different voice. Quran page artwork/recitation sources remain unchanged and exclusive to KSU; prayer times remain exclusive to ESA.

Validate the prepared local files with:

```powershell
python scripts/install-adhan-audio.py
# To import an already prepared matching folder instead:
python scripts/install-adhan-audio.py --source C:/path/to/matching-mp3-files
```

The importer validates all files before copying. Re-encoding with a different source format/encoder can change hashes; do not silently replace pinned bytes or edit hashes to hide a different recording.

## Browser contract

`GET /api/adhan-audio?clip=<catalogue-id>` reads only the matching local private file, verifies its hash and returns `200 audio/mpeg` with private caching. Missing, duplicate, unknown or extra selectors return `400`; a missing/changed recording returns `503 AUDIO_UNAVAILABLE`. No arbitrary path, URL, YouTube extraction, cookies or external proxying is accepted at request time. A browser preview follows the intro's completion event before starting its Adhan. Stopping clears the pending queue; a late completion from a replaced intro cannot consume the new Adhan.

Example from a running local preview:

```typescript
import {createHash} from 'node:crypto';
import {adhanSequence, adhanClips} from './src/core/adhan-sequence.ts';
const ids = adhanSequence('2026-10-30', 'dhuhr');
for (const id of ids) {
  const response = await fetch(`http://localhost:8082/api/adhan-audio?clip=${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== adhanClips[id].sha256)
    throw new Error('Different recording');
}
```

## Android playback

The same catalogue is packaged by a local Gradle asset task, without editing generated Expo Android files. A media foreground service holds audio focus/wake lock for the entire two-file queue and updates its stop notification as the active clip changes. Completion starts the next file; stop, focus loss, error or timeout clears the sequence. The bound is ten minutes, above the longest prepared pair (about 334 seconds); 0.5.0's four-minute cutoff would truncate Tobar and was removed. Volume and DND remain under Android/user control. Changing city/disabling cancels old alarms as before.

The separate hardware APK compiles the production Kotlin sources and private asset catalogue. It tests all six sequences and stopping in an intro; no harness receiver or instrumentation is included in the product.

## Verification status

- TypeScript: 44 tests PASS, including normal mapping, Friday-only Dhuhr, DST/year boundaries, invalid dates/prayers and source IDs.
- Native JUnit: 11 tests PASS (six ESA + five sequence/date tests).
- Typecheck and lint: PASS.
- Local HTTP: all twelve clips returned 200 `audio/mpeg` with exact catalogue hashes; malformed/duplicate/extra selectors returned 400.
- Browser Arabic: normal voices, Friday replacement, actual Maghrib intro → Rifaat and Friday intro → Al-Azhar transitions, and stop checked.
- Current native hardware playback/build/device delivery results will be appended after execution. The earlier 0.5.0 locked-screen result is not counted as a 0.6.0 playback test.
