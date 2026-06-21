# Reader revision 0.2: design and source decisions

## Problems addressed

The first reader fixed Al-Husary and Al-Saadi in code, put many large rectangular actions around the page, and sized the image from width only. Short screens required scrolling before all of the original page and controls could be seen. The revision makes provider choices explicit and gives the original Mushaf a dedicated flexible viewport.

## Research and design references

- [Material Design icon buttons](https://m3.material.io/components/icon-buttons/overview): compact, clearly labelled transport and reading actions.
- [Material Design bottom sheets](https://m3.material.io/components/bottom-sheets/overview): secondary choices remain outside the main reading surface.
- [Quran.com customization guide](https://quran.com/sq/explore/build-your-personalized-quran-experience): a product reference for reader/tafsir/display preferences. This is design research only; no Quran text, audio, images, tafsir or API from that service was used in the app.
- [Expo 58 audio](https://docs.expo.dev/versions/v58.0.0/sdk/audio/) and [StatusBar](https://docs.expo.dev/versions/v58.0.0/sdk/status-bar/): actual SDK contracts used by the implementation.

The implementation keeps the locked Emerald/Navy colors, bundled Cairo typography, and original unfiltered KSU PNGs. It uses the existing icon family; no unrelated raster artwork or icon library was added.

## Interaction model

The header opens the surah picker and exposes reading settings and full-screen mode. Page/ayah navigation sits below the image. A compact player groups reciter selection, bookmark, progress, repeat, previous/play/next and tafsir. Searchable, selected-state list rows replace stacks of large green buttons.

Reading settings provide a reciter, tafsir, complete-page/fill-width mode, explicit zoom and reset. Tafsir can change authors within its sheet; its query key includes the author and selected verse so cached text from a different author is not mislabelled. Bookmarks and explicit reading-plan confirmations are in the tools sheet.

Immersive mode hides the application tab bar and Android/iOS status bar and uses a shorter page/playback toolbar. Android Back exits immersive mode first. Leaving the reader pauses audio and restores the application navigation. Immersive mode is temporary; provider/display preferences are persisted.

## Geometry and content integrity

All rendering uses the same original `456 × 672` plane. Complete-page scale is `min(viewportWidth / 456, viewportHeight / 672)`. Fill-width scale uses viewport width. Zoom multiplies this single scale for both the image and every KSU highlight rectangle. Zoomed content can scroll in both axes. Original source pixels are never recolored, cropped into a different Mushaf or retypeset.

`tests/reader-layout.test.ts` checks whole-page containment across portrait/landscape/desktop sizes and uniform image/highlight scaling. Those calculations do not replace actual visual checks or a real Android device test.

## Catalogue provenance and bounded checks

Forty-one Hafs recording choices come from KSU's observed reader DOM and its captured `quraa_map` folder mapping. Five Arabic tafsir IDs come from the actual menu: `sa3dy`, `baghawy`, `katheer`, `qortoby`, `tabary`.

Warsh recordings are excluded because this reader currently displays the Hafs Mushaf. Spoken translations and a recording explicitly marked partial last-five-juz coverage are not misrepresented as complete Hafs recordings. Four new audio range samples returned 206/audio-mpeg; four additional tafsir samples returned 200 and the observed delimiter. The catalogue is not a claim that every verse file for every recording was fetched or validated. Source failures remain visible with retry or user-chosen alternatives.

Evidence: `ksu-evidence/reader-catalog-20261023.json` and `ksu-evidence/provider-http-samples-v0.2.json`. No cookies, authorization headers or private records are included.

## Application copy and repository attribution

The user requested that provider attribution live in GitHub/project documentation rather than the product interface. University/provider branding and the source-visit button were removed from both UI languages. Reciter/tafsir names and the truthful internet requirement remain. Endpoint hostnames, provenance comments, original artwork, response evidence and attribution in the repository are retained. No claim of ownership or upstream permission is introduced by this copy change. See `SOURCE_ATTRIBUTION.md`.

## Verification status

Typecheck/lint and all 23 tests pass. Production export and local Android builds have succeeded. Actual browser checks cover persisted Al-Afasy/Ibn Kathir choices, playback advancing 1:4 to 1:5 with the highlight, safe tafsir display, 150% zoom selection, reset, immersive mode, portrait/landscape containment, and Arabic/light plus English/dark layouts. Running UI screenshots and exact limits are in `QA_REPORT.md`. Native installation remains unverified; build/signature inspection does not substitute for a real-device smoke test.
