# Foreground Qibla guide —0.14.0

Explore → Qibla opens an explicitly activated compass. It does not request location on startup or infer coordinates from the selected ESA city. The user presses Use my location and grants foreground access on Android. Precise location is recommended; approximate access is accepted but visibly lowers confidence.

## Calculation and sensor contract

- GeographicLib Geodesic2.2.0 computes the WGS84 inverse initial bearing and distance to the fixed Kaaba reference21.422487°N/39.826206°E. This is an ellipsoidal geodesic model, not a rhumb-line bearing.
- Expo Location58.0.20 supplies foreground fixes, calibration level and true north. Android's inspected implementation corrects magnetic heading with `GeomagneticField` declination. A missing true-north value never falls back silently to magnetic north.
- The dial is a relative instruction: turn the phone until the Qibla arrow points toward its top. Rotation uses the shortest signed angle across north. The phone must be portrait and flat/parallel to the ground, with its top pointing in the facing direction. Landscape suppresses the arrow; tilt is explained but not automatically measured.
- Alignment is marked approximate only with reported high calibration, valid nonmocked coordinates, position uncertainty≤100m, recent position/heading (<60s), portrait orientation and a suitable distance from Kaaba/antipodal ambiguity. Its5° display threshold is a UI condition, **not a measured5° error guarantee**. Near Kaaba or the antipodal region the arrow is withheld.
- There is no fake heading, percentage confidence or promise of100% accuracy. Low/unknown calibration, stale fixes, magnetic interference, cases/metal, device quality and tilt can invalidate a reading. The screen recommends figure-eight calibration, an open area and verification against an established direction.
- Permission refusal, disabled location, unavailable sensors and45s without readings show distinct retry guidance. Acquisition labels distinguish permission, position and heading. Web displays a supported-device explanation instead of a pretend live compass.

## Privacy/lifecycle

Coordinates and heading stay only in screen memory. No ZAD/third-party web API, map provider, analytics, cloud snapshot or export receives them. The OS location provider may use its normal device services. Existing manual ESA prayer-city selection remains independent.

The subscription generation rejects callbacks after Stop, blur, background or unmount; late subscription handles are immediately removed. Errors clear the arrow and stop watchers. Native location permissions are foreground coarse/fine only; no background or location foreground-service permission is enabled. The app does not lock global orientation or change device location settings automatically.

## Verification boundaries

Six domain/session tests pass: independent GeographicLib Python2.1 reference fixtures for Cairo/London/New York/Sydney, invalid/near/antipodal coordinates, short north-crossing rotations, quality exclusions, permission-dialog state transitions and stale completion after Stop/blur. Browser Arabic Light390px and English Dark320px layouts, no initial arrow and explicit web limitation pass with zero observed horizontal overflow. Coordinates in tests are public city reference points, not user location.

The initial Android candidate opened but the owner reported no arrow; direct phone interaction also remained at the initial state. The final startup path skips an already-granted permission request, preserves the requested session through permission-dialog app-state changes, waits for foreground, optionally uses only a recent≤60s/≤100m system fix, and still obtains ongoing foreground updates. This addresses the start/cancellation boundary; no user coordinates were logged. A fresh permission prompt after this repair was not physically repeated.

The corrected APK was reinstalled over the candidate without clearing data or granting permissions by ADB. Direct Computer Use through a temporary USB scrcpy window observed a real directional arrow, location uncertainty and high sensor-reported calibration; Stop removed the arrow and restarting reacquired it. Physical comparison against a surveyed direction and full tilt/interference/OEM behavior are not claimed.

Real sensor/permission/alignment acceptance is recorded in the release metadata; mathematical/browser tests do not establish physical compass accuracy. No exact user coordinates are recorded in this documentation.

Sources reviewed: [Expo58 Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/), [Android position sensors](https://developer.android.com/develop/sensors-and-location/sensors/sensors_position), [GeographicLib JS](https://github.com/geographiclib/geographiclib-js), and [Geodesic inverse reference](https://geographiclib.sourceforge.io/html/python/code.html#geographiclib.geodesic.Geodesic.Inverse).
