# Quran source attribution and provenance

The Quran integration in Ramadan Journey uses the King Saud University Electronic Mushaf at <https://quran.ksu.edu.sa> exclusively for original Hafs page PNGs, verse audio recordings, Arabic tafsir, verse highlight coordinates and Quran navigation metadata. No alternate Quran content provider is used.

The university/provider name is documented here instead of the application interface, as requested by the product owner on 23 October 2026. This is a presentation decision: it does not change endpoint hosts, rewrite the original artwork, remove reciter/tafsir author names, or claim ownership of upstream content.

## Technical documentation

- [Original observed request documentation](KSU_API_DOCUMENTATION.md)
- [Typed API contract and local relay](API_CONTRACT.md)
- [Reader revision and catalogue scope](READER_V0_2_DESIGN.md)
- [Sanitized capture evidence](ksu-evidence/)
- [Third-party notices and distribution review](../THIRD_PARTY_NOTICES.md)

Observed requests and catalogue entries are distinguished from untested coverage in those documents. KSU website endpoints are internal interfaces, not a claimed official supported third-party API. No cookie, token or private user record is required in this documentation. Preserve these attribution and provenance files when publishing the source on GitHub.

Repository destination: [AMRYB/ZAD](https://github.com/AMRYB/ZAD), selected by the owner on 23 October 2026. Source documentation preserves provenance; publishing source does not assert upstream content redistribution permission or a production mobile release.
