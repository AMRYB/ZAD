# Reader polish verification — 0.4.0

## Implemented flow

The reader uses Font Awesome 7.3.1 through one typed icon component. This local private build uses the owner's Pro Classic Light 300 OpenType font. The public source has Free fallback fonts and a reproducible local-font installer; paid fonts/platform overrides are excluded from Git. SVG is not used by the app's icon controls.

Horizontal drags cycle the mounted player/navigation faces. The outgoing face moves sideways and fades behind the incoming face; neither face is unmounted, and the audio hook remains in the parent reader. A drag below the commit threshold springs back. Vertical motion does not cycle. New button presses are intercepted while the settling animation is busy. The visible grab-line and its row were removed; a semantic activation target remains on the rear-card edge for assistive technologies.

The surah name and chevron open surah selection in normal and immersive layouts. The immersive footer has five equal control slots with playback in the middle. Its image gap is 14 logical pixels. Bottom padding is `max(safeArea.bottom, 12) + 8`, outside the zoom canvas, so the page transform cannot consume the reserved controls/navigation clearance.

## Executed checks

- Typecheck/lint: PASS.
- Unit/integration suite: **30 PASS**, including actual Free glyph coverage, actual local Pro weight 300/glyph coverage, and sideways gesture intent/cancellation.
- Expo Doctor: **20/20 PASS**.
- Browser: Pro Light font family rendered in controls/tabs; surah dropdown opens and selects Al-Baqarah; lateral card cycles both directions; short/vertical drags do not cycle; rapid repeated drags do not open the page picker accidentally.
- Browser fullscreen at **390×844**, **360×800**, **844×390**: no horizontal overflow. Play-slot center differs from card center by less than **0.01 logical pixel**.
- At 200% zoom and after one-finger pan: stage clips the image, the image-to-card gap remains **14 pixels**, and portrait bottom clearance remains **20 pixels** at zero browser safe inset. Landscape measured ~19.6 pixels due browser rounding.
- Browser audio: a bounded Al-Baqarah 2:1 sample kept playing across a card cycle with repeat enabled; playback and repeat were then stopped.
- Screenshots: `screenshots/reader-v0.4-navigation-ar.png`, `screenshots/reader-v0.4-fullscreen-zoom-ar.png`.

## Limits

Browser pointer gestures and zero-inset browser geometry are not a real Android three-button-navigation or physical multitouch test. Native installation and actual TalkBack/reduced-motion interactions remain pending. The separate Android release record identifies the compiled artifact and signing checks.
