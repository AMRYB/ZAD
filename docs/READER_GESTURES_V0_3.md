# Reader gesture revision 0.3

## User interaction

- Pinch the page with two fingers to zoom from 100% to 300%, keeping the source pixel under the pinch midpoint.
- Drag with one finger to pan an enlarged page. Both axes clamp to the image edges; the image cannot be lost outside the viewport.
- At normal zoom, a deliberate horizontal swipe changes pages: Arabic rightward advances, leftward goes back; English reverses those directions. Short/mostly vertical swipes, cancelled gestures and out-of-range pages do not navigate.
- A gesture that uses two fingers cannot turn a page after one finger lifts. Taps still select original ayah overlays.
- Pull the bottom of the control card upward to cycle between audio controls and surah/ayah/page navigation. The front card rotates/recedes as the rear card rises. Both faces remain mounted; audio belongs to the reader, not either card.
- Per the user's final correction, no visible Player/Pages/Ayahs card headings or switch icon are shown. A small grab line supplies an accessible tap alternative. The surah picker says **سورة البقرة** (and corresponding current surah) without a book icon. The page selector fills the space between its arrows, uses 17px text, and has a minimum height of 56px.

Manual zoom/reset controls remain available in Reading settings. Provider branding remains absent from application copy; attribution lives in repository documentation.

## Implementation and references

`ReaderGesture` owns the focal transform, touch-count rebasing, containment and swipe intent. `MushafCanvas` applies one animated transform to the original page and all original ayah rectangles. Gesture frames update transient values rather than rerendering every rectangle. Bounds/center reset when the page, fit or viewport changes. A stable navigation callback avoids audio-progress rerenders of the canvas.

[React Native PanResponder](https://reactnative.dev/docs/panresponder) supplies multi-touch responder events; [Animated](https://reactnative.dev/docs/animated) supplies transforms and card transitions. The project retains [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) and introduces no new dependency. Reduced-motion settings disable the card transition duration. A narrowly scoped React refs lint exception documents that `PanResponder.create` registers event callbacks rather than executing their ref reads during render.

## Executed checks

- TypeScript and ESLint PASS; all **28 tests PASS**, including five gesture cases for focal anchoring, scale/pan bounds, pinch-to-single-touch rebasing, page intent/cancellation/boundaries and the short grab handle.
- Expo Doctor **20/20 PASS**; production web export PASS.
- Actual browser drag moved page 1 to 2 and page 2 to 1. An additional backward drag at page 1 did not navigate outside the Quran.
- Actual 150% zoom rendered `scale(1.5)`; a diagonal drag produced `translateX(79.1696px) translateY(70px)` while the current page remained 2. A later normal tap selected 1:4 correctly.
- After the short-handle fix, two complete upward cycles from the same 24px handle were checked against the settled front/hidden card state. Navigation exposes surah/page/ayah choices; the inactive card is removed from accessibility navigation.
- Actual recitation advanced 1:4 to 1:5 and then 1:6 with the navigation card in front; route exit paused playback. The audio source lifecycle is unchanged.
- At 390 × 844, the enlarged Arabic page selector measured approximately **249 × 56 CSS pixels**, with 17px text. Captures: `screenshots/reader-v0.3-player-ar.png` and `screenshots/reader-v0.3-navigation-ar.png`.

## Issue repaired during QA

The initial 12px drag-capture threshold could let a pointer leave the 24px handle before its parent acquired the responder. A 6px upward capture threshold now acquires it first; committing still requires a deliberate 44px upward drag. Horizontal/downward/short motions do not swap cards. A regression fixture checks that the first 11px movement remains inside the handle and captures before leaving it. Temporary event diagnostics were removed from the source before the final APK build.

## Limits

The available browser control supports single-pointer dragging; it does not expose a two-finger injection API. Pinch/rebasing behavior is implemented and covered by deterministic multi-touch input sequences, but **a physical two-finger gesture has not been tested on an Android device**. No Android installation, TalkBack, native interruption or rotation result is claimed. Build/signature/manifest/source checks are recorded separately in `ANDROID_APK_RELEASE.md`.
