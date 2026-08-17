# Day/night branding and startup video — 0.11.1

## Behavior

The owner-provided Morning_Icon.png and Evening_Icon.png are copied unchanged into assets/branding and native drawable-nodpi resources. Morning applies from sunrise inclusive until Isha; evening applies from Isha inclusive until the next sunrise. Boundaries come exclusively from the selected city's ESA monthly timetable in Africa/Cairo, including month/DST changes. The user's UI theme remains independent.

Launcher and large Quran/Adhan notification artwork follow the variant. The existing monochrome status-bar symbol remains. Following owner feedback, 0.11.1 enlarges artwork by approximately 34%, removing the original roughly 12.5% outer white border. Rendering preserves source PNGs: fractional launcher insets on API26+, a -8dp fallback on API24/25 and filtered 256px notification bitmaps. Launcher masks/normalization vary by device.

The supplied Portrate.mp4 is bundled unchanged: 15 seconds, 1080x1920 H264/AAC, 29,703,617 bytes. It replaces the startup spinner, fits inside the screen and starts muted with a sound toggle, Skip and Android Back. The underlying route is inaccessible during the overlay. Ordinary navigation does not replay it. Backgrounding pauses it; completion, error or a 25-second timeout continues to the intended route. Android's mandatory starting window is dark with a transparent mark; video begins after React/fonts/local state are ready.

## Native implementation and limits

BrandPolicy validates ordered official times and computes the next supplied boundary. Missing official data retains the last variant, or morning on a fresh install; no fixed hours are invented. City/language changes, foregrounding, boot, package/time/timezone changes, alarm permission changes and ESA cache updates recompute branding.

MorningIcon and EveningIcon target stable MainActivity. Only its launcher filter moves; app/auth deep links remain. API33+ switches atomically with DONT_KILL_APP; older Android enables the target before disabling the other. Notification content intents target MainActivity directly.

Boundary alarms are exact when already allowed, otherwise inexact, with no new permission prompt. A network-constrained six-hour persisted job reuses ESA's 24-hour cache; next month is fetched on the last calendar day. Missing-cache work does not immediately retry itself on failure. No GPS, account records, analytics or alternative provider is involved. Artwork refresh targets only existing own media services and starts no new playback.

OS/OEM caching, denied exact-alarm access and battery restrictions can delay visible changes. Force-stop suppresses background work until reopening. Physical overnight transitions, alternate launchers and Android24/25 rendering remain unobserved; policy and isolated Android16 checks are narrower evidence.

## Verification

Typecheck, clean lint, 82 TypeScript tests, 26 native tests, Doctor20/20 and production web export pass. Six isolated Android16 checks cover atomic day/night/day aliases, one launcher entry, retained process, enlarged launcher/notification pixels and five existing timer/widget/artwork regressions. The separate harness is excluded from production.

Browser observation confirms video playback, sound toggles and automatic completion/Skip revealing Home at 390x844; viewport override was reset. Actual screenshot remains private in .test-output/intro-controls-proof.png. Owner confirmed the initial launcher/notification artwork and video/Skip on Android. Owner also confirmed the final enlarged launcher/notification size is suitable. Final build/install evidence belongs in ANDROID_APK_RELEASE.md.

| Original asset | SHA256 |
|---|---|
| Morning_Icon.png | 64b1e58b5bec9a0e0f2b364b372661f332e85f88ff4e49674f32c05d8602d816 |
| Evening_Icon.png | 208ff5a940f9058ae269f72be9e2a1d05eae5ce9c9cbeea8f17f94e841c272cf |
| Portrate.mp4 | 373e126d556beafeed3f0522f98e1219e76a580d0b812c114fcb704bacfd0034 |

Sources: [Expo Video SDK58](https://docs.expo.dev/versions/v58.0.0/sdk/video/), [Android aliases](https://developer.android.com/guide/topics/manifest/activity-alias-element), [PackageManager](https://developer.android.com/reference/android/content/pm/PackageManager), [drawable resources](https://developer.android.com/guide/topics/resources/drawable-resource). Supplied assets are not an independently verified public redistribution license.
