# Third-party notices and provenance

- Expo/React Native and supporting packages retain their respective upstream licenses. The generated template LICENSE is preserved.
- Cairo UI fonts: bundled by `@expo-google-fonts/cairo`; the package contains the upstream SIL Open Font License. Preserve it when redistributing font assets. [Cairo source](https://github.com/google/fonts/tree/main/ofl/cairo).
- KSU Quran images, verse audio, hilites and tafsir: fetched from `https://quran.ksu.edu.sa` when requested, not bundled as a corpus. No claim of public redistribution permission is made. The supplied plan requires a usage/permission review before broad publication.
- Quran navigation metadata and transliterated names were captured from KSU's `js/quran-data.js`. That source includes the notice `Copyright (C) 2008 tanzil.info, Licenced Under GPL`. The metadata's upstream source attribution is preserved; no alternate Quran service was queried. Public distribution/license compatibility requires review rather than assuming that the app's template license covers this dataset.
- KSU report/source hashes and original HTTP samples: `docs/KSU_API_DOCUMENTATION.md` and `docs/ksu-network-evidence.json`.
- The crescent/book brand mark is code-native SVG created in this repository, distinct from Quran artwork. Generated PNGs have the SVG as their editable source.
- Prayer timetables: fetched exclusively from the Egyptian Survey Authority's official `praytimes.aspx` page and linked `monthlymwaket.aspx` form. Public city/table fixtures are preserved for parser tests. No claim is made that these website form endpoints are a supported public API. See `docs/ESA_API_DOCUMENTATION.md`.
- Adhan only: Cairo Adhan by Mohamed Rifaat, as identified on Islamweb's publisher page (audio ID 122665). The app downloads a hash-verified recording to private device files; the recording is not included in Git or the APK. Source availability does not establish redistribution licensing. Quran audio still comes exclusively from KSU.

## Dependency advisory review

The current npm dependency audit reports inherited high-severity findings involving `braces` and `node-forge` and their dependents. The reviewed advisories list no patched versions as of this check:

- [braces: CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [node-forge: CVE-2026-85393](https://github.com/advisories/GHSA-86w9-cpqp-85rv)

A non-breaking `npm audit fix` was attempted. A forced downgrade of Expo/React Native was not performed. Keep this item open for release review; passing functional checks does not erase dependency advisories. Do not expose a development Metro server as a public production service.
