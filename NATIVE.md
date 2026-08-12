# Giulia — Native wrappers (Tauri + Capacitor)

Deze map bevat de scaffold om de Base44 web-app als native apps te draaien:
- **Windows** via Tauri (global shortcut, system tray, autostart)
- **Android & iPad (iOS)** via Capacitor (push notifications, haptics, Split View)

> De Base44-builder compileert alleen de web-app. Tauri/Capacitor binaries
> bouw je **lokaal** met hun eigen toolchains. De frontend-bridge
> (`src/lib/nativeBridge.ts`) gebruikt géén npm-dependencies en is een no-op
> in de browser, zodat de web-build ongewijzigd blijft.

---

## 1. Tauri — Windows native app

### Vereisten
- Rust (`rustup`) + MSVC build tools
- `npm i -D @tauri-apps/cli@^2`

### Build
1. Vervang `src-tauri/build.frontendDist` door óf `"../dist"` (lokale build via
   `npm run build`) óf de live Base44 URL `"https://jouw-app.base44.app"`
   (WebView wijst direct naar Base44 — dan is geen lokale frontend-build nodig;
   verwijder in dat geval `build.devUrl`).
2. Voeg iconen toe: `src-tauri/icons/icon.ico` + `icon.png` (minimaal 256×256).
   Genereer met `npx tauri icon path/to/1024x1024.png`.
3. `npx tauri dev` — ontwikkel. `npx tauri build` — MSI/NSIS installer.

### Functies
- **Global shortcut** `Ctrl+Shift+Space` toont het verborgen borderless/transparent
  "palette" venster (`/quick`) — een command-line die de input direct naar
  `functions/interpretInput` stuurt (`source: "command"`).
- **System tray** met "Open Giulia", een dynamische "Focus vandaag" submenu
  (gevuld vanuit de frontend via `TauriFocusSync` → DailyPlan focus items) en
  "Quit". Linksklik op het tray-icoon opent het hoofdvenster.
- **Autostart met Windows** (geminimaliseerd via `--hidden`), draait op de achtergrond.

> `withGlobalTauri: true` exposeert `window.__TAURI__` zodat `nativeBridge.ts`
> Rust-commands kan aanropen zonder `@tauri-apps/api` te bundelen. De
> Tauri v2 menu/tray-API kan per versie licht verschillen — pas `lib.rs` aan
> indien de compiler daarover klaagt.

---

## 2. Capacitor — Android & iPad (iOS)

### Vereisten
- Node + Android Studio (Android) / Xcode + CocoaPods (iOS)
- Pakketten:
  ```
  npm i -D @capacitor/cli
  npm i @capacitor/core @capacitor/android @capacitor/ios @capacitor/haptics @capacitor/push-notifications
  ```

### Build
1. Bouw de web assets: `npm run build` (→ `dist/`). Of laat `server.url` in
   `capacitor.config.ts` wijzen naar de live Base44-URL.
2. `npx cap add android && npx cap add ios`
3. `npx cap sync`
4. `npx cap open android` (Android Studio → build APK) / `npx cap open ios`
   (Xcode → build voor iPad).

### Push notifications (échte systeemnotificaties)
- **Android**: voeg `google-services.json` (Firebase) toe aan `android/app/`.
  Registreer via `registerPushNotifications()` uit `nativeBridge.ts` bij app-start.
- **iOS**: upload een APNs-key; Capacitor `PushNotifications` handelt de rest.
- Stuur via de bestaande `sendPush`/`sendPushNotifications` backend-functies
  (server-side, via `asServiceRole`).

### Haptics
- `@capacitor/haptics` is al aangesloten in de Approvals-flow (goedkeuren =
  success, afwijzen = warning, fout = error) via `nativeBridge.haptic()`.

### iPad — Split View / Slide Over
- Capacitor zet `UIRequiresFullScreen = false` standaard, dus Split View en
  Slide Over werken. De web-UI is al responsive; de assistent blijft als
  zijbalk naast ander werk staan. Geen extra code nodig.

---

## 3. Frontend-bridge (`src/lib/nativeBridge.ts`)
- `isTauri` / `isCapacitor` — runtime-detectie (globals, geen deps).
- `haptic(style)` — fysieke feedback (Capacitor).
- `registerPushNotifications()` — systeem-push registratie + token.
- `setFocusItems(items)` — vult de Windows-tray met de focus items.
- `sendQuickCommand(text)` — command palette → `interpretInput`.
- `hideCurrentWindow()` — verbergt het palette-venster na verzenden.