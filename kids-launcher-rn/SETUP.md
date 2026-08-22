# Kids Launcher - Setup Guide

This is a **hybrid Android launcher app** with React Native embedded UI. The native Kotlin shell handles device lockdown and launcher behavior, while React Native provides the kid-friendly UI (ported from the `kids-learn-app` web app).

## Prerequisites

- Node.js 18+
- Java 17+ (JDK)
- Android Studio (for Android SDK)
- Android device or emulator (API 24+)

## Quick Start

### 1. Initialize the React Native project

```bash
# Install the React Native CLI globally if you don't have it
npm install -g @react-native-community/cli

# Create a new project with TypeScript template
npx @react-native-community/cli@latest init KidsLauncher --template react-native-template-typescript

# Or if you prefer the latest:
npx react-native@latest init KidsLauncher --template react-native-template-typescript
```

### 2. Copy source files

Copy all files from this `kids-launcher-rn/` directory into the newly created `KidsLauncher/` project, **overwriting** the default files:

```bash
# From this directory
cp -r android/app/src/main/* ../KidsLauncher/android/app/src/main/
cp -r src/* ../KidsLauncher/src/
cp package.json ../KidsLauncher/package.json
cp index.js ../KidsLauncher/index.js
cp app.json ../KidsLauncher/app.json
cp metro.config.js ../KidsLauncher/metro.config.js
cp tsconfig.json ../KidsLauncher/tsconfig.json
cp .gitignore ../KidsLauncher/.gitignore
cp SETUP.md ../KidsLauncher/SETUP.md
```

> **Note:** Be careful not to overwrite your `android/app/build.gradle` entirely — you may need to merge changes.

### 3. Install dependencies

```bash
cd ../KidsLauncher
npm install
# or
yarn install
```

### 4. Install additional native dependencies

```bash
npm install react-native-svg react-native-tts
# or
yarn add react-native-svg react-native-tts
```

For iOS (if building for iOS too):
```bash
cd ios && pod install && cd ..
```

### 5. Update Android `build.gradle` package name

Make sure `android/app/build.gradle` uses the package name `com.kidslauncher`:

```gradle
android {
    namespace "com.kidslauncher"
    // ...
}
```

And in `android/app/src/main/java/com/kidslauncher/MainApplication.kt`, update the package references if needed.

### 6. Build and run

```bash
# Start Metro bundler
npx react-native start

# In another terminal, build for Android
npx react-native run-android
```

### 7. Set as default launcher

After installing the app on your Mi Pad 6:

1. Press the **Home button**
2. Android will ask you to choose a launcher
3. Select **"Kids Learn"**
4. Tap **"Always"** to set it as the default

Alternatively, the app has a native module that can open launcher settings:
- This is accessible via the `KidsLauncher.openLauncherSettings()` bridge if you add a settings button.

## Architecture

```
┌─────────────────────────────────────┐
│  Native Android (Kotlin)              │
│  • Launcher intent filter (HOME)        │
│  • Back button blocking               │
│  • Boot receiver (auto-start)         │
│  • Device admin (lockdown)            │
│  • TTS native bridge                  │
│  • App launching bridge               │
├─────────────────────────────────────┤
│  React Native (TypeScript)              │
│  • MenuScreen - mode selection        │
│  • SayMode - speak letters            │
│  • CorrectMode - find the letter      │
│  • WriteMode - draw letters (SVG)     │
│  • MelodyMode - music + words         │
│  • VirtualKeyboard - on-screen keys   │
└─────────────────────────────────────┘
```

## Features Ported from kids-learn-app

| Feature | Web App | RN App | Notes |
|---------|---------|--------|-------|
| Menu with 4 modes | ✅ | ✅ | Same colors, cards, layout |
| Language selector (EN/AR/DV) | ✅ | ✅ | Same 3 languages |
| Say Mode - TTS + visuals | ✅ | ✅ | Sparkles, glow, bounce |
| Correct Mode - scoring/streak | ✅ | ✅ | Score, streak, celebrations |
| Write Mode - drawing canvas | ✅ | ✅ | SVG canvas with PanResponder |
| Write Mode - guide strokes | ✅ | ✅ | Sequential stroke reveal |
| Melody Mode - piano grid | ✅ | ✅ | Colorful keys, word assoc. |
| Melody Mode - word display | ✅ | ✅ | Same word associations |
| Keyboard input | Physical keys | On-screen virtual keys | Better for tablet |
| Fullscreen | Web API | Native Activity | Always fullscreen |
| Prevent exit | Web fullscreen | Block back button + HOME | Native advantage |

## Key Changes from Web to RN

1. **Keyboard input** → On-screen virtual keyboard (tablet-friendly)
2. **CSS animations** → React Native `Animated` API
3. **Tailwind CSS** → `StyleSheet` objects with same colors
4. **Web Speech API** → `react-native-tts` library
5. **SVG drawing** → `react-native-svg` with `PanResponder`
6. **lucide-react icons** → Emoji + custom text icons

## Troubleshooting

### "Package name mismatch"
Make sure `AndroidManifest.xml` package matches your `build.gradle` namespace.

### "TTS not working"
Install Google TTS engine from Play Store. Dhivehi may fallback to English if the voice pack is not available.

### "Cannot set as launcher"
Some OEM skins (MIUI, etc.) restrict third-party launchers. Go to:
**Settings → Apps → Default apps → Launcher** and select "Kids Learn".

### "App exits on back button"
The native `MainActivity.kt` overrides `onBackPressed()` to block it. If it still exits, check if MIUI has special back gesture handling.

## Building Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

To sign the APK for distribution, follow the [React Native signing guide](https://reactnative.dev/docs/signed-apk-android).
