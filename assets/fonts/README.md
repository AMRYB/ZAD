# Icon assets

UI icons use **Font Awesome Free 7.3.1**, Classic Solid and Classic Regular, as local OpenType fonts. No SVG renderer or remote icon CDN is used by application controls. The wordless launcher artwork is separate branding.

- Upstream: https://github.com/FortAwesome/Font-Awesome/releases/tag/7.3.1
- Original archive: https://github.com/FortAwesome/Font-Awesome/releases/download/7.3.1/fontawesome-free-7.3.1-desktop.zip
- `FontAwesome7-Solid-900.otf`: unchanged `otfs/Font Awesome 7 Free-Solid-900.otf`; SHA256 `daa92774861a14e9ccbccc5e73a5fba514271ba4d1bd7e5adbf952182bc00835`.
- `FontAwesome7-Regular-400.otf`: unchanged `otfs/Font Awesome 7 Free-Regular-400.otf`; SHA256 `d0d7ae248cfa08da7f1beaaad4844e3aff6f980ec4ec5bb31413a64d028b98b4`.
- Copyright Fonticons, Inc.; fonts licensed under SIL Open Font License 1.1. Full upstream notice is bundled as `FontAwesome-LICENSE.txt`.
- Exact npm metadata dependency: `@fortawesome/fontawesome-free@7.3.1`. `src/data/fa-icons.ts` selects codepoints; `src/ui/AppIcon.tsx` renders them with fonts loaded alongside Cairo in the root layout.
- `tests/icons.test.ts` verifies metadata version, free style availability and real glyph coverage in both shipped OpenType cmap tables.

Expo font-format guidance: https://docs.expo.dev/develop/user-interface/fonts/ and https://docs.expo.dev/versions/v58.0.0/sdk/font/ .

## Local Pro Light configuration

The current private preview uses the owner's Font Awesome Pro **7.3.1 Classic Light 300** font for every UI icon. The original supplied webfont is decompressed to OpenType using fontTools; glyph outlines and metrics remain the Light design. No CSS/JavaScript Kit CDN is used in the Android application.

The paid font, license notice, conversion manifest and platform-specific font modules stay outside Git (`assets/private/`, `src/ui/icon-fonts.native.ts`, `src/ui/icon-fonts.web.ts`). They are not included in public source archives. A clean public checkout builds using the bundled Free fonts, and does not claim to contain Pro assets.

Owners with an appropriate Pro license can reproduce the private configuration:

```powershell
python -m venv .font-env
.font-env/Scripts/python -m pip install 'fonttools[woff]==4.67.0'
.font-env/Scripts/python scripts/install-pro-font.py 'PATH/FontAwesome/webfonts/fa-light-300.woff2' --css 'PATH/FontAwesome/css/light.css'
```

An existing Light 300 OTF/TTF with embedded version information can be supplied instead. Restart Metro after generating platform-specific modules. The installer validates the Pro family, Light weight and version before creating local overrides; it never reads a token, executes download scripts, or contacts a CDN. The optional local-font regression test verifies weight 300 in the actual OS/2 table and all selected codepoints in the converted font's cmap.
