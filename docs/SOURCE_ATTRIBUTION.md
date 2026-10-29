# Quran source attribution and provenance

The Quran integration in Ramadan Journey uses the King Saud University Electronic Mushaf at <https://quran.ksu.edu.sa> exclusively for original Hafs page PNGs, verse audio recordings, Arabic tafsir, verse highlight coordinates and Quran navigation metadata. No alternate Quran content provider is used.

The university/provider name is documented here instead of the application interface, as part of the application presentation. This is a presentation decision: it does not change endpoint hosts, rewrite the original artwork, remove reciter/tafsir author names, or claim ownership of upstream content.

## Technical documentation

- [Original observed request documentation](KSU_API_DOCUMENTATION.md)
- [Typed API contract and local relay](API_CONTRACT.md)
- [Reader revision and catalogue scope](READER_V0_2_DESIGN.md)
- [Sanitized capture evidence](ksu-evidence/)
- [Third-party notices and distribution review](../THIRD_PARTY_NOTICES.md)

Observed requests and catalogue entries are distinguished from untested coverage in those documents. KSU website endpoints are internal interfaces, not a claimed official supported third-party API. No cookie, token or private user record is required in this documentation. Preserve these attribution and provenance files when publishing the source on GitHub.

Repository destination: [AMRYB/ZAD](https://github.com/AMRYB/ZAD). Source documentation preserves provenance; publishing source does not assert upstream content redistribution permission or a production mobile release.

## Egyptian prayer times and Adhan

Prayer times are obtained exclusively from the [Egyptian Survey Authority's official page](https://www.esa.gov.eg/praytimes.aspx) and its linked monthly WebForms page. Exact source city selectors, captured public tables, parsing/validation and requests are documented in [ESA_API_DOCUMENTATION.md](ESA_API_DOCUMENTATION.md).

Version 0.6 uses prayer-specific recordings and MBC intros, including the exact Friday and Al-Azhar clips supplied by the user. The source inventory, uploader labels, full hashes, decoded durations and private-asset setup are maintained in [ADHAN_AUDIO_V0_6.md](ADHAN_AUDIO_V0_6.md) and the shared `src/data/adhan-audio.json` catalogue. Prepared media is excluded from public Git and included only in the private preview APK. This supersedes the original single Rifaat download; availability is not a public redistribution-license claim. Quran recitation sourcing remains unchanged.


## Post-Adhan dua —0.13.0

The owner supplied [this Sha'rawy dua video](https://www.youtube.com/watch?v=mC0AcX-ACOo), uploaded by X-Team. Exact local preparation/source metadata are documented in ADHAN_DUA_AND_FOCUS_V0_13.md and src/data/adhan-audio.json. Attribution is based on the uploader title. The MP3 and signed stream metadata stay outside Git; public media redistribution permission is not established.
