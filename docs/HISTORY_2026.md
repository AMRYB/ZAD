# 2026 product chronology and authentic Git evidence

## Evidence rules

This document distinguishes a retrospective product storyboard from actual Git history. Commit dates and authors are retained as originally recorded; no April–September commits were fabricated or backdated.

The original remote ZAD website has seven commits dated 4–9 February 2026. The supplied mobile planning ZIP contained no Git repository. The current mobile implementation has 21 commits through its 0.3 delivery, dated 22–23 October 2026, plus subsequent ZAD naming and repository integration commits at their actual execution times.

No dated April–September development evidence was found in the supplied archive or fetched remote branches. A request for an April-to-today story is documented below as planning context, not represented as work performed in those months.

## April–October retrospective product storyboard — not Git facts

| Month | Proposed narrative / phase | Evidence status |
|---|---|---|
| April 2026 | Ramadan use cases, discovery and competitor research | Retrospective planning only; no dated April artifact supplied |
| May 2026 | Arabic navigation, palette and reading UX exploration | Retrospective planning only; no dated May artifact supplied |
| June 2026 | Tracker architecture and data-model direction | Retrospective planning only; no dated June artifact supplied |
| July 2026 | Prayer/fasting/goals tracking and offline storage concept | Retrospective planning only; no dated July artifact supplied |
| August 2026 | Quran provider evaluation and prototype direction | Retrospective planning only; no dated August artifact supplied |
| September 2026 | Reader architecture and KSU integration research | Retrospective planning only; no dated September artifact supplied |
| October 2026 | Supplied plan, observed KSU requests, mobile source, browser checks and local APK builds | Actual 22–23 October code and evidence are linked in the repository; Android installation/multitouch remains unverified |

## Original remote website commits

```text
3e15ed2 | 2026-02-04T23:37:58+02:00 | Add initial README with project title
e4150ed | 2026-02-04T23:41:47+02:00 | Add files via upload
f1c3e3f | 2026-02-08T00:16:27+02:00 | Add files via upload
a243a91 | 2026-02-08T00:16:59+02:00 | Add files via upload
2f2f048 | 2026-02-08T23:56:42+02:00 | add page tasbeh
f5df9ac | 2026-02-09T00:21:18+02:00 | update page tasbeh
438e8ff | 2026-02-09T00:23:02+02:00 | Merge pull request #1 from AMRYB/Seif-nady
```

The old tree is preserved in `legacy-web/`; see `LEGACY_WEB.md` for its original SHA and byte comparison.

## Mobile implementation commits through 0.3

```text
99bb741 | 2026-10-22T23:55:27+03:00 | Initial commit
90ae816 | 2026-10-23T00:39:15+03:00 | feat(core): add local journey rules and verified KSU geometry
74b635e | 2026-10-23T03:21:06+03:00 | feat(app): implement bilingual local journey and KSU reader
ed54ea6 | 2026-10-23T03:21:06+03:00 | feat(database): add private sync and server award foundation
6891a20 | 2026-10-23T03:22:22+03:00 | fix(privacy): disable automatic Android backup and unused permissions
af7252f | 2026-10-23T03:23:55+03:00 | fix(ui): preserve numeric ratio order in Arabic layouts
865215e | 2026-10-23T03:28:43+03:00 | docs: record design API provenance and executed verification
385fb0b | 2026-10-23T03:31:58+03:00 | build: record verified arm64 preview artifact and handoff status
a9b87ed | 2026-10-23T11:20:29+03:00 | docs(git): publish authentic implementation and delivery history
597ac63 | 2026-10-23T11:23:33+03:00 | feat(quran): add observed KSU reciters and tafsir catalogue
3b2d5ad | 2026-10-23T11:24:12+03:00 | feat(settings): persist Quran reciter tafsir and page-fit preferences
d184031 | 2026-10-23T11:25:11+03:00 | feat(quran): calculate complete-page and zoomed viewport geometry
eb7d09e | 2026-10-23T11:35:54+03:00 | feat(quran): redesign reader controls sheets and immersive page view
84d7ac6 | 2026-10-23T11:36:37+03:00 | chore(release): version the revised reader preview as 0.2.0
2478a49 | 2026-10-23T11:50:50+03:00 | fix(ui): keep provider attribution in repository documentation
f81e7fc | 2026-10-23T11:55:40+03:00 | docs(quran): record revised reader QA and source provenance
f711e45 | 2026-10-23T11:55:41+03:00 | build(android): record verified version 0.2 preview artifact
0224134 | 2026-10-23T12:26:40+03:00 | feat(quran): model focal pinch pan and deliberate page swipes
c7c99d1 | 2026-10-23T12:37:04+03:00 | feat(quran): add touch canvas and upward cycling reader cards
5ab9a68 | 2026-10-23T12:37:04+03:00 | chore(release): version gesture reader preview as 0.3.0
5c7d3c2 | 2026-10-23T12:40:00+03:00 | docs(release): record gesture QA and verified version 0.3 artifact
```

## Current ZAD history

The name change and repository integration appear as new commits dated when performed. Inspect all actual records with:

```bash
git log --graph --decorate --all --oneline
git log --format=fuller
git log --since=2026-04-01 --until=2026-10-24 --format=fuller main
```

Repository: [AMRYB/ZAD](https://github.com/AMRYB/ZAD). A retrospective storyboard cannot establish continuous development or contribution activity from April onward. If authentic dated evidence becomes available later, import it with its provenance rather than assigning invented dates.
