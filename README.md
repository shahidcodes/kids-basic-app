# Kids Learn

A small learning app for young children: letters, numbers and words in English, Arabic and Dhivehi. On Android it runs as a PIN-locked launcher, so a tablet stays on the app. I built it for my son.

It exists in three forms:

| Version | Where | Status |
|---|---|---|
| **Web** (Next.js) | [`kids-learn-app/`](kids-learn-app) · live at [kidyapp.vercel.app](https://kidyapp.vercel.app) | The original version |
| **React Native launcher** | [`kids-launcher-rn/`](kids-launcher-rn) | A port of the web UI into an Android home-screen launcher, with a native Kotlin module for kiosk mode |
| **Native Android** (Kotlin, Jetpack Compose) | [shahidcodes/kids-app-android](https://github.com/shahidcodes/kids-app-android) | The most complete version, with APK [releases](https://github.com/shahidcodes/kids-app-android/releases/latest) |

All three share the same learning modes: **Say** (press a key, hear the letter), **Correct** (find the letter shown), **Write** (trace letters) and **Melody** (the keyboard as a musical instrument).
