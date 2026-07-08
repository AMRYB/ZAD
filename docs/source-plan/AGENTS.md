# AGENTS.md — Codex Working Agreement

You are implementing **Ramadan Journey**, a large Arabic-first Ramadan Android application, from `docs/MASTER_PLAN.md` and `docs/FEATURE_BACKLOG.md`. Do not silently rewrite the requirements.

## Language contract
- **Talk to the user only in Arabic** for progress, explanations, completed actions, errors, questions and task handoffs. Egyptian Arabic is fine if natural.
- All master planning documents, ticket titles, code identifiers, PR descriptions and Git commit subjects must be **English**.
- **Application language:** Arabic by default for every first launch, independent of system locale. English is selected from Settings and saved. Fully translate visible UI and error messages in both languages. Support complete RTL ↔ LTR layouts.
- Never translate/retype Quran page artwork. Display original KSU PNGs.

## Palette lock
- Light mode: `#F8FAF7` background, `#FFFFFF` cards, `#176B57` primary, `#C99A42` gold, `#172D27` text.
- Dark mode: `#0B1323` background, `#15223A` cards, `#9ABCEB` primary, `#E4BC74` gold, `#F2F5FC` text.
- `#C99A42` is not accessible for small text on white. Add contrast-safe semantic colors rather than making guesses.
- User chooses Light / Dark / System in Settings; retain setting across launches.

## Quran content invariant
- `https://quran.ksu.edu.sa` is the **exclusive network content source** for Quran page images, audio, tafsir and hilites. Reuse verified endpoint builders, fixtures and KSU-specific parser, not alternative Quran APIs.
- NO fabricated Quran or tafsir content, auto-correction, third-party audio or hidden fallback. A content-source failure must show a clear retry/error message.
- Preserve PNG pixel values. Render highlights as a view overlay; no recoloring of the source image.
- KSU endpoints are website internals, not official documented third-party API contracts. Do not claim license permission. Do not run high-volume scraping without authorization.
- Treat HTML returned in tafsir as untrusted; sanitize or show safe plain text.

## Workflow required for EVERY implementation ticket
1. Inspect repository and current tests; identify next smallest independently testable ticket.
2. **Arabic before-action message:** what you will build, affected areas and verification method.
3. Implement one vertical slice with TypeScript types and feature-level tests.
4. Run applicable typecheck, lint, unit/integration tests; perform manual mobile test when possible.
5. Document what was and was not actually verified.
6. Make small conventional Git commits with English messages, grouped by the completed change.
7. **Arabic after-action message:** what changed, tests with actual PASS/FAIL, outstanding issues, commit hash, next ticket.
8. Update the English backlog status and changelog faithfully.

## Priorities
- P0: reproducible app → bilingual themes/direction → local core flows → KSU Quran QA → preview APK.
- P1: backend Auth/RLS/sync → XP/achievements and opt-in leaderboard → challenges → additional modules.
- P2: richer content, Family, AI, year-round engagement.
- Never introduce a fragile social or points system into the public build before server authorization and moderation controls.

## Security rules
- No hardcoded API service_role keys, user passwords, OAuth tokens, private journal content, cookies in logs or repo.
- Sensitive worship data is private by default; global boards only show consented alias and approved eligible point totals.
- User or client cannot directly change trusted XP balance. Server transaction/idempotency is required.
- Keep permissions minimal. Ask only when a tool requires explicit authorization.

## Android release contract
- `eas.json` preview profile must output direct-install `.apk`.
- Production `aab` profile remains separate for Google Play.
- Never write "APK ready" without a verified build artifact and actual Android installation smoke test. Use `docs/ANDROID_APK_RELEASE.md`.

## Stop-and-report
- Stop when upstream KSU content accuracy, permissions or public distribution is uncertain; explain the exact blocker in Arabic and proceed on independent app modules where possible.
- Never claim tasks or tests completed because they are listed in this plan.
