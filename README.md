# VerdeGo

## CS FYP 2026 - Group CS_08

### Group members

| Member           | Email                       |
| ---------------- | --------------------------- |
| **Meng Siau**    | hsia0003@student.monash.edu |
| **Ayush Sharma** | asha0300@student.monash.edu |
| **Tye Samuels**  | tsam0016@student.monash.edu |
| **Kloe Lashkariov-Lee** | klas0001@student.monash.edu      |
|                  | xxx@student.monash.edu      |


A React Native app built with [Expo SDK 57](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/).

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   From the output, open the app in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), or [Expo Go](https://expo.dev/go).

## Project structure

- `app/` — routes (file-based routing via Expo Router); each file here is thin and just renders a screen from `src/screens/`
- `src/screens/` — screen implementations, one folder per screen
- `src/components/` — shared UI components reused across screens
- `src/theme/` — design tokens (colors, typography, spacing), sourced from `design-system.json`
- `assets/` — images, fonts, and other static assets

## Branching

- `main` — production. Always deployable.
- `dev` — testing/integration branch. Feature branches merge into `dev` first; once verified, `dev` is merged into `main`.
- `feature/*` — individual feature work, branched off `dev` and merged back into `dev` via PR.

`main` and `dev` currently point to the same commit while the project is just getting started.
