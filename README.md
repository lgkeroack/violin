# Violin Audio Workstation

A browser and Android app for violin and other bowed strings. It has two tabs:

- **Workstation**: tuner, tuning presets, scale display, scale trainer, metronome, fingerboard and a multi-device mixer.
- **Song Play**: a Rocksmith-style play-along game. Notes fly toward you on a 3D highway: colours are strings, numbers are fingers. The app listens through the microphone and scores pitch and timing.

## Song Play

| Mode | What it does |
| --- | --- |
| **Learn a Song** | Dynamic difficulty. Each phrase starts with only its key notes and gains notes (levels 0–5) as you play it accurately. Mastered phrases turn purple. With Master Mode on, their notes fade out so you play from memory. Mastery goes up to 110%. |
| **Score Attack** | Easy / Medium / Hard / Master. Streak multiplier up to ×4, Perfect/Early/Late/Sharp/Flat feedback, and strikes (three misses in a row). Medals from bronze to platinum. |
| **Riff Repeater** | Loop any range of phrases at 25–125% speed, at a fixed or dynamic level. Speed Trainer adds 5% after each loop played with at least 90% accuracy. |

Also included:

- A tuning check before each song.
- Guide melody, backing chords or drone, and a click track.
- A latency offset and pitch tolerance setting.
- Per-phrase results, with a one-tap jump into Riff Repeater on the weakest phrase.

### Songs

- **251 built-in songs** in 12 genres: Beginner, Folk, World, Celtic, Old-Time, Bluegrass, Classical, Rock & Metal, Blues & Jazz, Hymns, Holiday, Technique. Every melody is either public domain or an original riff written for this app. They are simplified single-line arrangements written in ABC notation (`src/songs/library/`).
- **Find Online**: live search of [The Session](https://thesession.org) (about 23,000 traditional tunes). Results are fetched at runtime and are not bundled. Contains information from The Session, made available under the [ODbL](https://opendatacommons.org/licenses/odbl/).
- **Import**:
  - MIDI files (`.mid`) of any song you own. You pick the melody track.
  - ABC notation pasted in or loaded from a file (for example from abcnotation.com).

Every song is arranged automatically for the selected instrument (violin, viola, cello, bass, fiddle tunings and more). Strings, fingers and positions are chosen by dynamic programming, and songs are transposed by octaves to fit the instrument's range.

## Audio input on phones

- The built-in mic works out of the box. Tap **Enable microphone** if the browser asks.
- **Wired headset (TRRS) mics, USB-C/OTG audio interfaces and USB mics** appear in the Song Play **Input** picker. The app switches to them automatically when they are plugged in, and back to the built-in mic when they are unplugged.
- For USB interfaces, choose **Left / In 1** or **Right / In 2** to pick the channel your instrument is on. Use the boost slider for quiet line-level signals.
- On touch devices, input monitoring through the speaker starts muted to avoid feedback. Use headphones if you want the guide melody or backing.
- Bluetooth mics work but add a lot of delay, so wired or USB is recommended.

## Install as a web app (PWA)

The app is published to GitHub Pages at **https://lgkeroack.github.io/violin/**. Every push to `main` that changes the web app redeploys it (`.github/workflows/pages.yml`).

- **Android (Chrome):** open the link and tap **Install app** in the tab bar, or use Chrome's menu → *Add to Home screen*.
- **iPhone/iPad (Safari):** tap Share → *Add to Home Screen*.
- **Desktop (Chrome/Edge):** use the install icon in the address bar.

The installed app opens full screen, works offline after the first load (a service worker caches it), and updates itself. When a new version has downloaded, a banner offers **Reload**. If you dismiss it, the update applies the next time the app starts.

The microphone, wired headsets and USB audio interfaces work in the browser the same way they do in the APK. *Find Online* still needs an internet connection.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Android app

A prebuilt, signed APK is in [`releases/`](releases/). To install it, copy it to the phone, open it, and allow installs from that source.

### Automatic updates (no new APK needed)

The app updates itself over the air using the open-source [`@capgo/capacitor-updater`](https://github.com/Cap-go/capacitor-updater) plugin, self-hosted on GitHub Releases. No account or third-party service is involved, and update statistics reporting is turned off.

1. Every push to `main` that changes the web app runs the **Live web update** workflow (`.github/workflows/web-update.yml`).
2. The workflow builds the app, zips it, and publishes `bundle-<version>.zip` and `update.json` to the [`web-latest`](https://github.com/lgkeroack/violin/releases/tag/web-latest) release.
3. On launch, and when you come back to it after 30+ minutes, the app checks `update.json`. If there's a newer version it downloads it in the background and verifies its SHA-256 checksum.
4. A banner offers **Restart now**. Otherwise the update applies the next time the app restarts.
5. If an update fails to start, the app rolls back to the previous version automatically.

The tab bar shows the running version (`v1.2.<build> · app 1.2.0`).

Native changes still need a new APK: new permissions, native plugins, or the launcher icon. To ship one, bump `versionName`/`versionCode` in `android/app/build.gradle` and sign it with the same key so it installs over the old one. If the web app starts depending on that new native code, also raise `android/min-native-version`. Older installs then show a "download the latest APK" message instead of loading an update they can't run.

To build it yourself (requires the Android SDK and JDK 21):

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease   # signed if android/keystore.properties exists
./gradlew assembleDebug     # debug-signed APK
```

`android/keystore.properties` (not committed) looks like this:

```
storeFile=/path/to/release.jks
storePassword=…
keyAlias=…
keyPassword=…
```

The **Android APK** GitHub Actions workflow (`.github/workflows/android.yml`) runs when you trigger it manually or push a `v*` tag, and uploads the APK as a build artifact. To get release-signed builds, set these repository secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD`. Without them, the workflow builds a debug APK.
