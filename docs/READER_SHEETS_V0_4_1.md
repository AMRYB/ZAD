# Reader sheets verification — 0.4.1

The immersive card has two equal sections. Arabic places the current ayah selector on the physical right, with playback and tafsir on the left. English mirrors the layout. Page arrows and the page-number chip are absent from this card; the canvas still supports page swipes, and page navigation remains in the normal navigation card/settings.

All reader sheets use a 44-pixel drag target. Its height follows the pointer directly and retains intermediate heights when released within the allowed range. A deliberate pull below the lower threshold dismisses the sheet. The list can scroll independently; resize capture only applies at its top boundary. Height is clamped to the current viewport and top safe inset. Reduced motion is respected for settling. Native accessibility height actions and web keyboard controls coexist with the close/backdrop actions.

## Executed browser checks

- Arabic immersive card: right ayah and left actions have equal measured width (163.4 pixels each at 390×844); no page-arrow buttons. No horizontal overflow at 360×800 or 844×390.
- Ayah selector opened the numeric picker, selected ayah 2 and was restored to ayah 1.
- Surah handle: expanded height 828 decreased to **628** for a **200-pixel downward drag**, then increased to **778** for a **150-pixel upward drag**. Both intermediate heights remained after release.
- Surah list scrolled by **844 pixels** while the sheet stayed **778 pixels** tall. A subsequent handle pull dismissed it without the close button.
- Reciter sheet changed from **607.675** to **487.675** for a **120-pixel downward drag**, then dismissed with a longer pull.
- Landscape surah sheet stayed within the 390-pixel viewport (height ~280.8, subject to browser pixel rounding).
- Web height adjustment and Escape dismissal were exercised. The final Escape check waited for the sheet element to disappear after animation.
- Screenshots: `screenshots/reader-v0.4.1-fullscreen-ar.png`, `screenshots/reader-v0.4.1-reciter-sheet-ar.png`.

Three new policy tests cover continuous height, cancellation/dismissal and scroll intent. The final suite/release results are recorded in the APK release metadata.

Native installation, physical Android finger gestures, hardware-back/system-navigation interaction, TalkBack and reduced-motion settings have not been device-tested. Browser pointer checks do not replace those gates.
