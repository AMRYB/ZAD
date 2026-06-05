# RAMADAN JOURNEY — CODING HANDOFF PACKAGE

All project specifications are **English**. The **app is Arabic-first with an English toggle in Settings**. The coding agent must explain every action and result **in Arabic**.

1. Start with `docs/MASTER_PLAN.md`.
2. Put `AGENTS.md` at the root of the actual source repository if using Codex.
3. Track incremental tasks in `docs/FEATURE_BACKLOG.md`.
4. Use `config/theme-tokens.ts` for the locked light/dark palettes.
5. Use `config/eas.json` only after bootstrapping a real Expo project and validating configuration.
6. Follow `docs/ANDROID_APK_RELEASE.md` to build and test an actual APK.
7. Use `docs/QA_ACCEPTANCE.md` for sign-off.
8. See `docs/GIT_AND_MILESTONES.md` to preserve an honest Git history; April–October retrospective concepts are **not fabricated commits**.

The existing `ramadan-journey-ksu-v1.zip` from the preceding conversation is a **prototype reference**, not a release-ready full application or verified APK.

**Suggested first instruction to Codex:**

> Read AGENTS.md and docs/MASTER_PLAN.md. Inspect the existing Ramadan Journey KSU prototype. Create the smallest reproducible Expo + TypeScript project, migrate the existing code faithfully, add the two approved palettes, and implement Arabic default with an English selection inside Settings. Execute the relevant tests, make small real conventional commits, and explain every step and result to me in Arabic. Do not backdate Git commits. Do not use Quran content sources other than quran.ksu.edu.sa. Do not claim that an APK exists until you have built and installed a standalone preview APK on an Android device.
