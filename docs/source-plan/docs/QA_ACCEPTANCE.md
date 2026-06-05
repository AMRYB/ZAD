# RELEASE ACCEPTANCE CHECKLIST & TEST PLAN

This document is the sign-off sheet. A test is `NOT RUN` until an actual output/artifact proves it ran.

| Test ID | Procedure | Expected | Initial status |
|---|---|---|---|
| Q-001 | Install direct APK without Metro | App launches standalone | NOT RUN |
| Q-002 | Fresh install on English phone | Arabic UI, RTL | NOT RUN |
| Q-003 | Switch Settings to English | English LTR, saved across restart | NOT RUN |
| Q-004 | Switch system/app theme | Exact selected Light/Dark tokens | NOT RUN |
| Q-005 | Open KSU page 1 | Correct PNG | NOT RUN |
| Q-006 | Open KSU page 604 | Correct PNG | NOT RUN |
| Q-007 | Multi-line selected ayah page 3 | Correct visible overlay | NOT RUN |
| Q-008 | KSU Husary audio: 1:1 → 1:2 | Verse transition at audio ended | NOT RUN |
| Q-009 | KSU Saadi tafsir 1:4 | Safely displayed text | NOT RUN |
| Q-010 | Disable Wi-Fi during reading | Explicit KSU error; no fallback | NOT RUN |
| Q-011 | Enter check-in offline, restart | State persisted | NOT RUN |
| Q-012 | 29/30 day calendar | Correct adjusted mapping | NOT RUN |
| Q-013 | Sign in as A vs B | Records isolated | NOT RUN |
| Q-014 | Duplicate eligible event | Exactly one XP entry | NOT RUN |
| Q-015 | Opt out public leaderboard | Public row hidden | NOT RUN |
| Q-016 | Delete account | Access/personal data removed per policy | NOT RUN |
| Q-017 | Large Arabic font, accessibility | No clipping/unclear controls | NOT RUN |
| Q-018 | Android back, audio cleanup | No ghost playback or crash | NOT RUN |

### Existing local evidence (not a replacement for mobile checks)
- `ksu-core.test.mjs`: 52 rectangle fixture matches for first 3 pages and 7 navigation cases (reference evidence from prototype).
- `ksu-exhaustive-local-check.mjs`: earlier structural/local checks for navigation and URL generation; not live media check.
- KSU CDP report proves sample website requests only.

### Sign-off metadata for every build
`Version:`, `Android package:`, `Build ID:`, `Git SHA:`, `APK hash:`, `Devices:`, `Run date:`, `Tester:`, `Known P0/P1 bugs:`, `Content usage approval:`, `Release decision:`.
