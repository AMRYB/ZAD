# Adhan follow-up dua and interruption handling — 0.13.0

Every normal prayer and Friday Dhuhr now uses the same three-stage queue: the existing prayer intro, its existing Adhan, then the user-supplied Sha'rawy dua. ESA scheduling and the ten-minute reminder remain unchanged. Stop ends the whole queue; per-prayer reminder mute still affects only that prayer.

## Supplied recording

[User-supplied video](https://www.youtube.com/watch?v=mC0AcX-ACOo), titled “Du'a after Adhan دعاء ما بعد الآذان للشيخ محمد متولي الشعراوي”, uploaded by X-Team. Metadata and the public audio stream were retrieved without account credentials. The title identifies the speaker; this is not independent archival authentication or a public redistribution license.

The private local MP3 is mono44.1kHz/96kbps, **30.174354 seconds / 363,041 bytes**, with metadata removed. Exact SHA256 and source metadata are in `src/data/adhan-audio.json`. The thirteen recordings are hash-checked by `scripts/install-adhan-audio.py` and again inside the APK. The preceding twelve files remain byte-identical, including both accepted Isha trims. No MP3, signed stream URL or private download metadata is committed to Git. Public redistribution remains a separate rights gate.

## Audio-focus behavior

Previously any negative Android focus callback called `halt()`, releasing the player and discarding the remaining queue. `AdhanFocusPolicy` now maps temporary ducking to20% playback volume, temporary/exclusive loss to a retained pause, and focus gain to the previous playback state. A deliberate mute stays muted through focus changes. Permanent loss retains the session with a Resume notification action; another application's permanent focus takeover may require that explicit action.

The player is started only after preparation. A paused player resumes from its retained position; a focus callback after clip completion cannot restart the completed clip. Each listener checks its playback generation and explicit-stop generation, so delayed focus gain cannot resurrect a stopped session. Pausing releases the wake lock and watchdog; resuming reacquires them. Existing Stop, mute/unmute and stale-notification isolation are retained. No device volume or global audio mode is changed.

Four JVM policy tests cover duck/gain, pause/gain, manual mute and permanent loss/reset. The complete native suite passes30 tests. These policy tests do **not** simulate actual Android notification delivery, phone calls or OEM behavior. Locked-screen notification interruption, physical audibility and the full intro/Adhan/dua transition remain pending on a connected phone.

Reference reviewed: [Android audio focus](https://developer.android.com/media/optimize/audio-focus).
