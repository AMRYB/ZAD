# Emerald Tasbih and collision sound — 0.12.2

## Behaviour

The owner requested green beads and an optional collision sound. The local gradient renderer now uses emerald tones; the accepted arched/gapped layout is retained. A short original PCM effect plays at the first contact point (animation progress0.55), before the receiving bank rebounds. The forward animation is split at that point so feedback follows the actual animation callback rather than a separate wall-clock timer. Queued counts each have one contact callback. Reverse/undo motion is silent. Reduced-motion forward counting provides the sound immediately without visual movement.

The bilingual Tasbih settings sheet has a Bead sound switch independent of Gentle vibration. New records enable it; older snapshots omit the optional field and use the enabled default without rewriting their existing counts or schema version. A stored false value is preserved. Non-boolean values are rejected during restore. Existing cloud snapshots and backups retain this setting through the same private devotional state.

## Audio implementation and provenance

`scripts/render-tasbih-sound.py` deterministically synthesizes the original effect from two damped sine components and seeded transient noise. The canonical bundled file is `modules/zad-adhan/android/src/main/res/raw/tasbih_bead.wav`. It is mono PCM16,22050Hz,1984samples (about90ms), with peak amplitude about0.537 and no clipped samples. No third-party recording, new dependency, network call or permission is used.

Android loads the resource into a one-stream SoundPool with sonification audio attributes and a quiet per-stream gain. It never requests/abandons audio focus, changes global audio mode, changes device volume or creates playback notifications. This avoids adding the UI effect to the recitation/Adhan media-session lifecycle. Source inspection establishes this design; simultaneous audible playback still requires a physical-device test.

Web/iOS use the existing Expo Audio player and the same WAV. The preview hook does not change global audio mode or activate lock-screen controls. Audio is gated by screen focus, foreground state and the current saved sound preference. Disabling sound pauses/stops it immediately. The Android pool releases on screen blur and module destruction; the hook player is managed by Expo and pauses on blur/background. A setting update does not restart or reset the bead animation.

## Verification scope

The new domain test covers restoring records without the sound field, independent sound/haptics choices, retained nonzero counters/daily totals, false-value round-trip and invalid-type rejection. Release/browser/build results are recorded in ANDROID_APK_RELEASE.md and BUILD_METADATA.json. No physical audibility or concurrency test is inferred from waveform checks or compilation. The owner previously chose APK testing later.

Primary API references: [Android SoundPool](https://developer.android.com/reference/android/media/SoundPool), [Expo SDK58 Audio](https://docs.expo.dev/versions/v58.0.0/sdk/audio/), [Expo module lifecycle](https://docs.expo.dev/modules/module-api/#ondestroy).
