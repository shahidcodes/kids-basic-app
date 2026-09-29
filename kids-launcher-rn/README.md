# Kids Learn launcher (React Native)

An Android home-screen launcher built from the [web version](../kids-learn-app) of Kids Learn. The UI is React Native; a native Kotlin module handles the launcher and kiosk behaviour:

- registers as the home app and pins itself with lock task mode
- starts on boot
- PIN pad for parents to unlock settings and exit

The UI covers Say, Correct, Write and Melody modes with an on-screen keyboard, in English, Arabic and Dhivehi. Where a device has no Dhivehi text-to-speech voice, speech falls back to English.

## Running

```bash
npm install
npm run android
```

Requires Node 18+, JDK 17 and the Android SDK.

## Other versions

- [Web app](../kids-learn-app) (Next.js): the original version
- [Native Android app](https://github.com/shahidcodes/kids-app-android) (Kotlin): the most complete version, with [APK releases](https://github.com/shahidcodes/kids-app-android/releases/latest)
