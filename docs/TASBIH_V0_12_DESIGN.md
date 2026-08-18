# Tasbih visual revision — 0.12.0

## Visual direction

The owner supplied a small promotional reference showing a horizontal dark bead strand, a central counter and restrained white controls. The implemented screen follows those functional visual elements rather than the surrounding tilted-phone marketing composition. ZAD's Emerald Light / Navy Dark tokens, Cairo typography and Font Awesome Pro Light/Free fallback system remain intact.

TasbihBeads.tsx renders an onyx-style strand locally with gradients, highlights, mineral flecks, shadows and a connecting cord. The counter is centered with a slim current-round indicator. A primary count button sits between undo and confirmed reset. The current remembrance is shown in full below; totals/rounds/target share a quiet statistics strip. Long Arabic phrases wrap and remain available in English mode with their existing translation.

Vibration and preset/custom targets move into the existing draggable ReaderSheet. Their existing reducer actions, data IDs, daily semantics, confirmation and persistence remain unchanged. No migration, new dependency, remote image, telemetry or permission was added. UI dates use the shared Cairo local-date hook.

## Motion and input

A native-driver animated value moves identical beads by one spacing along a sampled curve. Modulo interpolation makes the repeated strand continuous; long-running animation coordinates are periodically normalized. Undo moves in the opposite direction; reset/phrase changes do not animate across an arbitrary distance. Reduced motion stops/reset transforms.

Tap on the bead/counter region or primary button adds one. A deliberate lateral drag or downward pull adds one on release. The responder suppresses the associated press so one gesture cannot count twice. Scroll remains available outside the counting region. Count controls retain accessible names/disabled states and minimum 48px hit targets; the primary action is 66px. Numeric ratios remain LTR inside either text direction.

## Actual verification

- Typecheck, full lint and the existing 82-test source suite PASS. The change reuses existing devotional rules; no implementation-mirroring screenshot test was added.
- Actual browser interaction: bead tap and primary tap, sideways drag and downward drag each increment once; undo restores the initial count and daily total. Switching remembrance retains independent counters. Reset confirmation was opened/cancelled without deleting records.
- Vibration preference off/on persists through the UI; physical haptic feedback requires Android acceptance. Invalid zero target is rejected; Arabic-digit input normalizes and saves; the original goal is restored after QA.
- Arabic Light at 390x844 and English Dark at 320x720 visually inspected. No horizontal document overflow at 320px. Long Arabic remembrance and its English translation remain complete. Browser settings are restored after QA; source screenshots remain private in .test-output/.
- Final APK checks and device acceptance are recorded in ANDROID_APK_RELEASE.md / BUILD_METADATA.json. No unperformed physical accessibility or vibration test is implied by browser results.

## Rendering provenance

Built-in imagegen was attempted for a transparent photoreal onyx bead, but the tool returned a usage-limit error. No generated bitmap was produced or shipped. The final artwork is procedural React Native code in src/ui/TasbihBeads.tsx; the CLI/API fallback was not used. There is no external bead image license or network dependency.

Prompt summary for the unsuccessful attempt (not verbatim): “A single photorealistic black onyx rosary bead, isolated on transparent background, subtle charcoal marbling/bronze flecks, soft upper-left studio light, clean silhouette, no cord, text, logo or surrounding objects.” This describes the unsuccessful built-in generation attempt, not a delivered raster asset.

References: [React Native Animated](https://reactnative.dev/docs/animated), [PanResponder](https://reactnative.dev/docs/panresponder), [Expo SDK58](https://docs.expo.dev/versions/v58.0.0/). Broader TalkBack/large-system-text/OEM gesture testing remains a separate gate.
