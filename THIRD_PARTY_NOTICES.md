# Third-party notices and provenance

- Expo/React Native and supporting packages retain their respective upstream licenses. The generated template LICENSE is preserved.
- Cairo UI fonts: bundled by `@expo-google-fonts/cairo`; the package contains the upstream SIL Open Font License. Preserve it when redistributing font assets. [Cairo source](https://github.com/google/fonts/tree/main/ofl/cairo).
- KSU Quran images, verse audio, hilites and tafsir: fetched from `https://quran.ksu.edu.sa` when requested, not bundled as a corpus. No claim of public redistribution permission is made. The supplied plan requires a usage/permission review before broad publication.
- Quran navigation metadata and transliterated names were captured from KSU's `js/quran-data.js`. That source includes the notice `Copyright (C) 2008 tanzil.info, Licenced Under GPL`. The metadata's upstream source attribution is preserved; no alternate Quran service was queried. Public distribution/license compatibility requires review rather than assuming that the app's template license covers this dataset.
- KSU report/source hashes and original HTTP samples: `docs/KSU_API_DOCUMENTATION.md` and `docs/ksu-network-evidence.json`.
- The crescent/book brand mark is code-native SVG created in this repository, distinct from Quran artwork. Generated PNGs have the SVG as their editable source.
- Prayer timetables: fetched exclusively from the Egyptian Survey Authority's official `praytimes.aspx` page and linked `monthlymwaket.aspx` form. Public city/table fixtures are preserved for parser tests. No claim is made that these website form endpoints are a supported public API. See `docs/ESA_API_DOCUMENTATION.md`.
- Adhan only: the private 0.6 preview packages the twelve user-requested/source-pinned prayer intros and recordings described in `docs/ADHAN_AUDIO_V0_6.md`. Sources include the user's MBC clip links, the user's official Al-Azhar link, separately identified Tobar Fajr/Isha uploads and Islamweb's Shuaisha/Husary/Rifaat files. Prepared recordings are excluded from public Git; only source metadata/hashes are tracked. Public source availability does not establish redistribution licensing or permission for a public app release. This supersedes 0.5's single privately downloaded Rifaat file. Quran audio still comes exclusively from KSU.

- Supabase JS 2.118.0 and react-native-url-polyfill 4.0.0 report MIT licenses in their installed package manifests; preserve upstream license files. Repositories: [Supabase JS](https://github.com/supabase/supabase-js), [URL polyfill](https://github.com/charpeni/react-native-url-polyfill).
- The guarded Expo Audio 58.0.10 customization modifies its installed Android sources during native prebuild. Upstream Expo licensing remains applicable; only the patch/configuration is maintained here.

## Dependency advisory review

The 0.10.0 audit reports five high findings through the Expo CLI/code-signing/node-forge/zod chain. Doctor 20/20 and functional tests do not constitute a clean dependency audit. The earlier review below is historical.

### Earlier dependency review

The current npm dependency audit reports inherited high-severity findings involving `braces` and `node-forge` and their dependents. The reviewed advisories list no patched versions as of this check:

- [braces: CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [node-forge: CVE-2026-85393](https://github.com/advisories/GHSA-86w9-cpqp-85rv)

A non-breaking `npm audit fix` was attempted. A forced downgrade of Expo/React Native was not performed. Keep this item open for release review; passing functional checks does not erase dependency advisories. Do not expose a development Metro server as a public production service.
