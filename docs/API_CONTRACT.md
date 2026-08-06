# Runtime API contracts

## KSU content: actual original URLs

Base origin: `https://quran.ksu.edu.sa`. Builders and numeric validation: `src/core/ksu.ts`.

| Purpose | Method / path | Verified content type |
|---|---|---|
| Hafs page | GET `/ayat/safahat1/{1..604}.png` | image/png |
| Selected Hafs reciter | GET `/ayat/mp3/{allowlistedRecordingFolder}/{SSS}{AAA}.mp3` | audio/mpeg; bounded range samples returned 206 |
| Highlight points | GET `/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page={p}` | application/json |
| Selected Arabic tafsir | GET `/interface.php?ui=pc&do=tafsir&author={author}&sura={s}&aya={a}` | text/html; verse + `|||` + HTML |
| Page meanings | GET `/interface.php?ui=pc&do=tarjama&tafsir=ar_mu&b_sura={s}&b_aya={a}&e_sura={s2}&e_aya={a2}&11` | application/json |

The current mobile reader uses the page image, audio, points and single-verse Arabic tafsir. The page-meanings builder is implemented and historically verified, but a separate meanings-margin UI has not shipped.

The original request capture, statuses, query parameters and response samples are documented in [KSU_API_DOCUMENTATION.md](KSU_API_DOCUMENTATION.md) and [ksu-network-evidence.json](ksu-network-evidence.json). Those captures concern samples, not a full corpus audit. KSU website internals are not a guaranteed public API contract.

## Browser relay: implemented and locally exercised

Browser fetch cannot read the observed `interface.php` response directly because `Access-Control-Allow-Origin` is absent. The web preview sends the same query to `GET /api/ksu`. The relay reconstructs a URL using the original KSU builders; it never accepts a hostname or arbitrary destination URL.

- Allowed operations: Hafs hilites (`t=28`), five allowlisted Arabic tafsirs and `ar_mu` page meanings.
- Unknown/duplicate query keys, invalid numbers and unsupported operations: 400.
- Upstream failure/timeout: 502, no fallback provider.
- At most four distinct in-flight requests, concurrent identical requests deduplicated.
- Up to 128 short-lived, public-content response entries; five-minute expiry.
- No inbound cookies/Authorization are forwarded; no upstream cookies/tokens are exposed.
- Response preserves KSU body/content type and states `X-Content-Source: https://quran.ksu.edu.sa`.

Native Android uses the KSU URL directly; it does not require this web server to read the Quran. The browser relay is not a newly invented Quran API or an alternate content dataset. Web production exports require a running Expo server target, as documented by [Expo API Routes](https://docs.expo.dev/router/web/api-routes/).

## Cloud database RPCs: SQL implemented, hosted service not provisioned

See [DATABASE.md](DATABASE.md). The RPC signatures are implemented in the migration and exercised by local PostgreSQL tests. They are not claimed as live network endpoints. No fake project URL or secret is supplied.

## Adhan preview audio — 0.6

`GET /api/adhan-audio?clip=<allowlisted-id>` serves a locally prepared private MP3 after size/SHA-256 verification. All twelve catalogue IDs were exercised: 200 `audio/mpeg`. Missing/unknown/duplicate/extra selectors: 400. Missing/changed local media: 503. No arbitrary URL/path or third-party extraction is accepted. The browser plays a prayer intro and then its matching Adhan; Android uses the same catalogue with private bundled assets, without this server. See [ADHAN_AUDIO_V0_6.md](ADHAN_AUDIO_V0_6.md). ESA remains the exclusive timetable authority; KSU remains the exclusive Quran provider.

## Revision 0.2 provider verification

The recording catalogue contains 41 Hafs options observed in KSU’s DOM and captured `quraa_map`. The Arabic tafsir allowlist is `sa3dy`, `baghawy`, `katheer`, `qortoby`, `tabary`. Original author/folder identifiers are preserved; arbitrary strings or destinations are rejected. See `ksu-evidence/reader-catalog-20261023.json` and `provider-http-samples-v0.2.json` in that folder for exact method/URL/status/type samples. The live local relay returned 200 for Ibn Kathir and Al-Baghawi and 400 for an unknown author. No claim is made that every file in every recording was fetched.
