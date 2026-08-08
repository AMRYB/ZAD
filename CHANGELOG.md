# Changelog

## 0.1.0 — current implementation

- Created an Expo 58 / React Native 0.88 TypeScript application and real dependency lockfile.
- Added Arabic-first onboarding, Cairo typography, persistent English and two locked themes.
- Implemented local records, private notes, daily habits, goals, calendar and reading-plan flows.
- Reused verified KSU metadata and geometry; added original-page image rendering, overlays, navigation, bookmarks, Husary audio lifecycle and safe Saadi text.
- Added an allowlisted web-only KSU relay for the observed CORS restriction; native stays direct to KSU.
- Implemented local SQLite persistence and tested a PostgreSQL cloud-foundation migration.
- Added validated JSON backup export/import with explicit replacement confirmation and screen-draft reset.
- Added safe fallback navigation for directly loaded plan/calendar routes.
- Disabled inherited Android automatic backup and blocked unused overlay/vibration permissions for the private local preview.
- Added meaningful domain, geometry, relay, SQLite and PostgreSQL tests and a CI check workflow.
- Recorded actual browser checks and native-build/device limitations without inventing earlier milestones.
