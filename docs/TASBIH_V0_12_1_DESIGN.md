# Tasbih reference correction — 0.12.1

## Owner's correction

The initial 0.12.0 continuous strand did not reproduce the open central gap in the supplied promotional reference. The owner requested two visible bead banks and a bead crossing the gap, contacting the other bank, with an outer bead returning at the opposite edge. They subsequently requested stronger curvature and better use of the empty lower screen area.

## Implemented behaviour

The idle strand has two tightly packed banks, separated by a clear gap equal to one quarter of the available width (capped at 112 logical pixels). A local onyx-style renderer remains in use. No source bead artwork was supplied independently of the small promotional screenshot; this is a code-rendered reconstruction rather than a claim of identical raster artwork.

A curved cord rises toward the centre. Its sampled path has a 58-pixel rise from either outer edge to the centre, rather than the nearly flat initial correction. A single leading right bead crosses leftward, touches the left bank, pushes it one bead spacing and settles with a small rebound. At the same time, a replacement enters from the right and an outer left bead exits. Identical endpoint geometry allows the visual loop to reset without a bead teleporting across the visible gap. Undo plays the path backwards. The counter changes immediately through the existing reducer; motion completion never dispatches another count.

Animation uses native transforms on Android and the JS driver on web. Rapid single-count changes queue rather than restarting the bead halfway across the gap. Opposite pending changes cancel visually; count data remains controlled by the reducer. Reset, external multi-count updates, reduced-motion changes and unmount cancel the visual queue. Gesture release still suppresses a duplicate press.

The remembrance card and statistics precede the lower count/undo/reset row. This screen opts into growing content height through an optional shared Screen style; other screens keep their prior defaults. The bead/counter region receives spare height, positioning the actions near the bottom without a fixed blank footer. A minimum content size and the existing ScrollView preserve access on short screens and long remembrance text.

## Verification

Release-specific results are recorded in ANDROID_APK_RELEASE.md and BUILD_METADATA.json after artifact verification. The owner requested an APK to test later, so no 0.12.1 physical-device acceptance is implied by earlier 0.12.0 acceptance.

References: [React Native Animated](https://reactnative.dev/docs/animated), [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/). No dependency, API provider, permission, storage schema or private record is changed.
