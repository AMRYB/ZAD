# Design decisions

## Product structure

Five persistent destinations: Home, Quran, My Day, Progress, More. Reading plans and the seasonal calendar are focused stack screens. Pickers and tafsir are sheets. Unsupported future modules do not occupy empty tabs.

The home hierarchy is: today's context, a restrained reflective card, actual check-in totals, continue-reading card, and personal goals. There are no fabricated streaks, XP balances, prayer times, or piety scores.

## Typography

Cairo Regular (`Cairo_400Regular`) and Cairo Bold (`Cairo_700Bold`) are bundled through `@expo-google-fonts/cairo`, so UI text does not depend on a font CDN. Typical body size is 16, secondary text 13–14, section titles 19–21 and page titles 30. Body line height is 1.65 times font size. Text may wrap; key controls have a 48-point minimum height. Quran artwork is not typeset or recolored with the UI font. Saadi source text remains Arabic even in the English interface, with an explicit source-language note.

## Colors

| Role | Light | Dark |
|---|---|---|
| Background | #F8FAF7 | #0B1323 |
| Surface | #FFFFFF | #15223A |
| Primary | #176B57 | #9ABCEB |
| Gold accent | #C99A42 | #E4BC74 |
| Main text | #172D27 | #F2F5FC |

Gold is decorative, not small body text on white. Additional semantic muted/border/soft/error/onPrimary tokens are defined centrally in `src/ui/theme.ts`. Status is communicated in words, not by color alone. Light primary on white is approximately 6.41:1; gold on white is approximately 2.57:1.

## Direction and responsive geometry

Application locale is chosen independently of the operating-system locale. Components use explicit row direction, text alignment and writing direction; the tab order reverses. The Mushaf coordinate plane always stays LTR, because KSU points describe image coordinates. Its entire 456×672 plane is uniformly scaled to the measured width, up to 700 points. The app allows device rotation; the original portrait-only sample configuration was deliberately corrected.

The 390×844 browser viewport is a responsive-layout check, not an Android-device or TalkBack test. Physical device font scaling, navigation gestures and audio lifecycle still require native QA.

## Privacy and states

The user enters without an account. Record changes are saved in a serialized queue; errors remain visible and can be retried. Unreadable saved data is not overwritten with empty state. Quran loading/error/retry states are separate from local data. A missing highlight service leaves an available page image readable. Only explicit confirmation adds a page to a reading plan.

## Assets and visual evidence

Screenshots in `docs/screenshots/` capture the actual running app; they are not mockups. Development test records are synthetic and remain separate from a fresh Android installation.
