# Direct bead pulling — 0.13.0

The “Your counter is saved automatically” footer is removed, and bottom content padding is reduced. Existing persistence, emerald beads, upward arch, open centre, collision effect and vibration/sound preferences remain.

The capture PanResponder now belongs to an independent outer View rather than the Pressable that handles accessible taps. This prevents Pressable's responder handlers from overriding actual finger movement. The bead follows a captured sideways/downward pull, then completes its transfer on release. A deliberate single-finger movement of at least28px counts once; short drags, upward scrolling, multi-touch and canceled gestures do not count. A drag suppresses its subsequent press, and reduced motion retains immediate feedback. No journey/storage migration is required.

Two domain tests cover directions, thresholds, cancellation and one-count behavior. Actual browser coordinate drags verified20px gives no count, while left, right and down each add exactly one. Undo restored the original21 total/zero current-day count. The removed sentence is absent and the controls fit the390×844 view. A browser input warning was captured during viewport change; there were no captured application error logs during reader playback. This is not a native touch or physical sound verification. Device touch/scroll behavior remains pending.

Implementation: `src/core/tasbih-pull.ts`, `src/ui/TasbihBeads.tsx` and `src/screens/Tasbih.tsx`. Reference reviewed: [React Native PanResponder](https://reactnative.dev/docs/panresponder).
