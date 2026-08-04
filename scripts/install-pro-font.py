"""Install a user-supplied Font Awesome Pro 7.3.1 Light font locally.

Requires fonttools[woff]. Never downloads fonts or reads account credentials.
Usage: python scripts/install-pro-font.py PATH_TO_FONT [--css PATH_TO_light.css]
"""
import argparse
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("font", type=Path)
parser.add_argument("--css", type=Path)
args = parser.parse_args()
font = TTFont(args.font)
names = {item.toUnicode() for item in font["name"].names}
if not any("Font Awesome 7 Pro" in name for name in names):
    raise SystemExit("Expected Font Awesome 7 Pro.")
if font["OS/2"].usWeightClass != 300:
    raise SystemExit("Expected the Light 300 font.")
notice = args.css.read_text(encoding="utf-8").split("*/", 1)[0] + "*/" if args.css else ""
if not any("7.3.1" in name for name in names) and "Font Awesome Pro 7.3.1" not in notice:
    raise SystemExit("Version 7.3.1 could not be verified. Supply the matching --css file.")
root = Path(__file__).resolve().parent.parent
target = root / "assets" / "private"
target.mkdir(parents=True, exist_ok=True)
suffix = "otf" if font.sfntVersion == "OTTO" else "ttf"
filename = f"FontAwesome7-Light-300.{suffix}"
font.flavor = None  # Decompress WOFF2; preserve the actual Light glyph outlines and metrics.
font.save(target / filename)
module = f"""// Generated local Pro asset override; excluded from Git.
export const iconFonts={{FontAwesome7Light:require('../../assets/private/{filename}')}};
export const iconFontFamily:string|null='FontAwesome7Light';
"""
for platform in ("native", "web"):
    (root / "src" / "ui" / f"icon-fonts.{platform}.ts").write_text(module, encoding="utf-8")
(target / "NOTICE.txt").write_text(notice + "\nUser-supplied commercial font; not part of the public source distribution.\n", encoding="utf-8")
manifest = {"version": "7.3.1", "weight": 300, "filename": filename,
            "sourceSha256": hashlib.sha256(args.font.read_bytes()).hexdigest(),
            "sha256": hashlib.sha256((target / filename).read_bytes()).hexdigest()}
(target / "font-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(f"Installed Font Awesome Pro 7.3.1 Light locally: {filename}")
