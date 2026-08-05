# Egyptian Survey Authority prayer timetable integration

## Scope and verification

Prayer times come exclusively from the Egyptian Survey Authority (ESA), starting at <https://www.esa.gov.eg/praytimes.aspx>. The monthly link on that page leads to <https://www.esa.gov.eg/monthlymwaket.aspx>. There is no alternate provider or local astronomical calculation.

Verified on 2026-10-23/24: browser selection of Cairo and October, direct successful WebForms requests, the complete 31-day Cairo table, and the app's same-origin relay for Cairo and Alexandria. Browser actions and independent HTTP responses were checked. These are website form endpoints, not a claimed public JSON API. No CDP Network recording was available for this capture; form controls and executed HTTP requests establish the request contract.

Only the public city `<select>` and prayer `<table>` are committed as test fixtures. Cookies, hidden form-state values and private device data are excluded.

## Requests

| Method | URL | Parameters | Verified status / Content-Type | Purpose |
|---|---|---|---|---|
| GET | `https://www.esa.gov.eg/praytimes.aspx` | None | 200 / `text/html; charset=utf-8` | Official entry page: daily city table, calendar and monthly link |
| GET | `https://www.esa.gov.eg/monthlymwaket.aspx` | None | 200 / `text/html; charset=utf-8` | Obtain city options and transient WebForms hidden fields |
| POST | `https://www.esa.gov.eg/monthlymwaket.aspx` | Form-urlencoded body below; no query | 200 / `text/html; charset=utf-8` | Retrieve the selected city/month table |
| GET | app `/api/esa?city=…&month=2026-10` | Exact allowlisted ESA option value and year-month | 200 / JSON | Web-only fixed-destination relay; native Android calls ESA directly |

POST body names (values for hidden state must be read freshly, never hardcoded):

```text
__VIEWSTATE=<ephemeral value from GET>
__VIEWSTATEGENERATOR=<ephemeral value from GET>
__EVENTVALIDATION=<ephemeral value from GET>
__LASTFOCUS=
__EVENTTARGET=ctl00$placeholder1$DropDownList2
__EVENTARGUMENT=
ctl00$placeholder1$DropDownList1=القـاهـرة
ctl00$placeholder1$DropDownList2=10
```

The response table is `#placeholder1_GridView1`, with city, Gregorian date, Hijri date, Fajr, sunrise, Dhuhr, Asr, Maghrib and Isha columns. Example observed row:

```html
<td>القاهرة</td><td>2026-10-23</td><td>12 جماد الأول 1448</td>
<td>5:35 ص</td><td>7:2 ص</td><td>12:39 م</td>
<td>3:51 م</td><td>6:16 م</td><td>7:34 م</td>
```

Parsed app response excerpt:

```json
{"city":"القـاهـرة","month":"2026-10","days":[{"date":"2026-10-24","hijri":"13 جماد الأول 1448","times":{"fajr":"05:36","sunrise":"07:03","dhuhr":"12:39","asr":"15:50","maghrib":"18:15","isha":"19:33"}}],"source":"https://www.esa.gov.eg/monthlymwaket.aspx"}
```

The real response contains every day of the month and a `fetchedAt` timestamp; the excerpt is shortened. Source city IDs retain elongation characters; displayed names remove only elongation. The catalogue contains 82 observed options. A selected city with missing source rows fails visibly.

## Reproducible TypeScript example

Run from the repository with Node supporting TypeScript stripping:

```powershell
node --input-type=module -e "import {fetchOfficialMonth} from './src/services/esa-source.ts'; const m=await fetchOfficialMonth('القـاهـرة','2026-10'); console.log(m.days.find(d=>d.date==='2026-10-24'));"
npm test
```

Use a current, ESA-published month when running later. `fetchOfficialMonth()` performs one GET and one POST, validates the city, complete date coverage, unique dates and chronological times. It rejects wrong-year/wrong-city/incomplete responses. Redirects are rejected, responses bounded, requests timed out, and state kept out of logs. The web relay has validated selectors, a bounded 24-hour cache and at most three in-flight upstream jobs. Native cache stores parsed months in private app files and bounds retained entries.

## Dates, caching and Android scheduling

ESA publishes wall-clock times. Conversion uses `Africa/Cairo`, never the device's current timezone or a constant UTC offset. The captured October table itself changes from summer to winter times on 2026-10-30. Tests check both published rows and UTC conversion across that transition. Sunrise is displayed and never receives an Adhan alarm.

The Android module schedules one-shot `AlarmManager.setExactAndAllowWhileIdle` intents for five prayers and, when enabled, reminders exactly 600,000 ms earlier. It keeps a rolling 14-day horizon from saved source months. A persisted daily `JobScheduler` task refreshes official data and extends that horizon; delivery time of background refresh jobs is controlled by Android. Already scheduled alarms do not require internet or a running JavaScript process. The displayed horizon makes actual source coverage visible.

Enabling requires user notification permission and Android's Alarms & reminders special access. Without these the UI reports scheduling as blocked; it does not silently substitute inexact alarms. Changing city, disabling alerts or changing reminder settings cancels old PendingIntents. Generation checks reject stale deliveries. Boot, package update, timezone/time changes and exact-alarm grants restore cached alarms. Boot receivers never start media playback services.

At prayer time a `mediaPlayback` foreground service plays the downloaded recording with alarm audio attributes, audio focus, a bounded wake lock and a stop action. It releases resources on completion, error, stop or focus loss. It does not change the phone's volume or DND settings. Android force-stop suppresses app work until reopening; OEM battery restrictions and denied/revoked permissions are real delivery limits.

The observed monthly form has no year selector. The parser never relabels January of one year as January of the next; unpublished future-year responses fail closed. Coverage depends on the authority publishing that year and a later refresh. No unsupported year query parameter is invented.

## Egyptian Adhan recording

Publisher page: [Cairo Adhan — Mohamed Rifaat](https://audio.islamweb.net/audio/index.php?audioid=122665&page=audioinfo). Its observed `contentUrl` is `https://quran-fjamfcbbeybteyat.z01.azurefd.net/Audio3/Adan/1027.mp3`.

Verified GET with publisher `Referer: https://audio.islamweb.net/`: 200, `audio/mpeg`, 407,680 bytes, MP3 duration 203.716 seconds. SHA-256: `39964e1b6df88cfc30e66ca18cbc8efe5829fbf82d24210ebddc3d435eebd96c`. A bare request sometimes redirected away from audio, so the implementation sends the publisher referer and verifies bytes before using them. Changed/unavailable bytes fail visibly, without substituting another recording.

Android downloads the file once into private app storage; the web preview uses a fixed-source bounded relay. The recording is not committed to Git or embedded in the public source/APK. The publisher's availability is not a claim of redistribution licensing. Quran recitations remain exclusively KSU; this separately sourced recording is only for Adhan.

## Release verification

See `ADHAN_VERIFICATION.md` for executed tests, Android results and remaining device gates. A successful build alone does not establish background delivery on a phone.
