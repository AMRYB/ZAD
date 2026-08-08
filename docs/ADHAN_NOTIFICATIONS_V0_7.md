# Prayer notification controls — 0.7.0

## Behavior

The existing official ESA schedule delivers one reminder exactly 600000 milliseconds before each of the five prayers. Sunrise remains excluded. The reminder now explicitly says that prayer is in ten minutes, shows Android's countdown to the saved prayer timestamp, and offers **Mute this Adhan**. Selecting it changes the same notification to **Unmute this Adhan** without another alert sound. The countdown does not require JavaScript or polling. Android controls the final collapsed/expanded appearance and lock-screen privacy.

The user selected **this prayer only**, not a global mute. Muting a reminder skips both that prayer's intro and its Adhan; its arrival is shown silently. Other prayers and their reminders remain scheduled normally. Undo is available in that reminder before prayer time. The reminder expires at prayer time and is explicitly dismissed by the prayer receiver. Preview playback remains an explicit listening action.

During active playback the notification has **Stop audio** and **Mute / Unmute**. Mute changes only this MediaPlayer's volume to zero; the recording continues, and the setting remains in force when the intro transitions to Adhan. Unmute restores this player's volume. Stop releases playback and clears the pending clip. A new session starts unmuted. Matching controls are available inside the Adhan screen during native playback. Phone alarm volume, ringer settings, DND and notification-channel preferences are never changed.

## Identity, persistence and cancellation

Reminder/Adhan pairs share a length-prefixed identity containing city, Cairo event date, prayer, schedule generation, prayer timestamp and test flag. A reminder cannot mute another prayer, day, city, generation or later test. Selected mutes are committed to private native preferences with expiry; they survive JavaScript/process recreation. Expired entries are pruned when read/updated. An expired reminder control is ignored. Changing the schedule generation invalidates earlier controls.

The action receiver is explicit and not exported. PendingIntents are immutable and have distinct data/action identities. Active playback controls additionally carry a random session ID; a button retained from an earlier notification cannot mute or stop a newer session. No new Android permission or public receiver was added. Existing alarm/audio/notification opt-ins remain required.

Test alarms retain their honest +30s reminder/+60s playback timing, with an explicit test label and 30-second countdown. The real ten-minute schedule is verified independently; tests do not pretend to wait ten minutes.

## Executed evidence

- Typecheck, lint and all 44 TypeScript tests passed after the feature change.
- The isolated Android 16 APK compiled the maintained production Kotlin sources and exact private recordings. It did not modify ZAD's data or schedules.
- Actual scheduled production pairs were checked for exactly ten-minute spacing. The production reminder's Arabic title, future countdown timestamp, chronometer flags and one-prayer mute action were verified on Android.
- AlarmManager delivered the accelerated reminder. Its real PendingIntent muted the matching prayer, undid the mute, and muted it again. The selection was present in native preferences and did not affect a different prayer.
- The scheduled muted prayer produced a silent notification and did not start playback. Its reminder was removed and its expired action was rejected.
- A following prayer event started normally. Notification mute persisted through intro completion into the next MP3; notification unmute and stop worked. A new preview began unmuted and ignored a stale mute action. The system alarm-volume value stayed unchanged.
- English reminder title/action labels passed. The device reported `screenOff=true` at the end of this run; no external acoustic measurement or new final-product user acceptance is asserted from that single sample.
- The disposable harness was disabled and uninstalled after testing. Final product build, native unit tests, signature, package comparisons and actual update/launch are recorded in `ANDROID_APK_RELEASE.md` after execution.

## Reproduce the isolated hardware test

Prepare the local private font/recordings as described in the build documentation. Build `tests/android-harness`, install its debug APK on an authorized device, and grant notification/exact-alarm access only to that disposable package. Then run:

```powershell
adb shell am instrument -w -e mode notification-controls com.zad.adhanharness/expo.modules.zadadhan.AdhanHardwareTest
adb shell am instrument -w -e mode cleanup com.zad.adhanharness/expo.modules.zadadhan.AdhanHardwareTest
adb uninstall com.zad.adhanharness
```

The test inspects only its own notifications and preferences. No test receiver or instrumentation is shipped in ZAD.

Implementation references: [Android notification actions](https://developer.android.com/develop/ui/compose/notifications/create-notification), [countdown and timeout API](https://developer.android.com/reference/androidx/core/app/NotificationCompat.Builder), [per-player volume](https://developer.android.com/reference/android/media/MediaPlayer#setVolume(float,float)).
