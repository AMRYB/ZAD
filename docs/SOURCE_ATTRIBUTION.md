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

The separate Adhan recording is identified by its [publisher page](https://audio.islamweb.net/audio/index.php?audioid=122665&page=audioinfo) as Cairo Adhan by Mohamed Rifaat. Its verified URL, SHA-256 and download requirements are recorded in the ESA integration document. It is downloaded into private app storage, rather than committed or bundled as a recording. Availability is not a licensing claim. Quran recitation sourcing remains unchanged.
