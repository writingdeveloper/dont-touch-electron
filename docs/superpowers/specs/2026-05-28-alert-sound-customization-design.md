# Alert Sound Customization — Design Spec

**Date:** 2026-05-28
**Status:** Approved for implementation planning
**Origin:** User feedback from Polina (trichotillomania user) requesting more assertive sounds + custom uploads.

---

## 1. Problem

The current app plays a fallback 800 Hz sine tone for the alert because:

- `src/App.tsx:22` requests `/alert.wav`, but **`public/alert.wav` does not exist** in the repository.
- The Web Audio API fallback in `src/App.tsx:27-44` is intentionally minimal — a single short sine tone.
- Users (including Polina) experience an underwhelming alert that doesn't help them break the touch habit reliably.

Polina also reported wanting:
- More **assertive sounds** (e.g., spoken "Stop", "Hands down").
- The ability to **upload their own** sounds.

Secondary problem: the Aptabase self-hosted dashboard at `aptabase.devmanage.duckdns.org` reportedly shows no usage data. Verification confirmed the SDK config is correct and the server returns 200 OK on direct probe; root cause is most likely server-side (app key not registered or debug filter active). We will add diagnostic logging so misconfiguration is detectable from the client side.

## 2. Goals

1. Ship a library of built-in alert sounds — tones and assertive multilingual voices.
2. Allow users to upload custom audio files for personal sounds.
3. Integrate sound selection into the existing Settings UI, with **preview playback**.
4. Make sound selection language-aware (default to the user's UI language, but allow "all languages" browsing).
5. Add Aptabase debug logging so future analytics issues are diagnosable from the client.

## 3. Non-Goals

- Multiple sounds in sequence / playlists.
- Time-of-day-aware sound rotation.
- Stronger visual/haptic alert effects (separate concern, separate spec).
- Cloud sync of custom sounds across devices.
- Sound editing (trim, normalize) inside the app.

## 4. Architecture Overview

```
src/
├── audio/
│   ├── AlertSoundService.ts      ← Single-purpose: load + play + preview sounds
│   ├── soundPresets.ts           ← Static metadata for built-in sounds
│   └── customSoundStorage.ts     ← Renderer-side façade over IPC for custom sounds
├── components/
│   └── SettingsPanel.tsx         ← New "Sound" sub-section in existing settings
├── types/
│   └── app-settings.ts           ← Add alertSoundId + alertVolume

electron/main/
├── index.ts                       ← New IPC handlers + Aptabase debug logging
└── customSoundIO.ts              ← Main-side file I/O for custom sounds

public/sounds/                     ← Bundled with the app (extraResources)
├── tone-soft.mp3                  ← Gentle chime
├── tone-chime.mp3                 ← Default replacement for missing alert.wav
├── tone-buzzer.mp3                ← Assertive buzzer
├── voice-en-stop.mp3
├── voice-en-handsdown.mp3
├── voice-ko-sondaejima.mp3        ← "손대지마"
├── voice-ja-sawaranai.mp3         ← "触らないで"
├── voice-zh-bie.mp3               ← "别碰"
├── voice-es-no.mp3                ← "Para, no toques"
└── voice-ru-stop.mp3              ← "Стоп, опусти руки" (Polina's language)
```

Generation of voice files: produced offline once via a high-quality TTS API (e.g., ElevenLabs or OpenAI tts-1-hd) and committed to the repo. **No runtime TTS dependency, no API key in the shipped binary.**

## 5. Components

### 5.1 `AlertSoundService` (single-purpose)

Responsibilities:
- Resolve a `soundId` to a playable URL (preset path or custom-file URL via IPC).
- Play the sound at the configured volume.
- Provide a **preview** mode that doesn't suppress concurrent alerts.
- Fall back to the existing Web Audio sine tone if playback fails.

Interface (rough):
```ts
class AlertSoundService {
  async play(soundId: string, volume: number): Promise<void>
  async preview(soundId: string, volume: number): Promise<void>
  async listAvailable(language: Language, includeAllLanguages: boolean): Promise<SoundOption[]>
}

interface SoundOption {
  id: string                              // 'tone-chime' | 'voice-ru-stop' | 'custom-<uuid>'
  label: string                           // displayed in UI (translated for built-ins)
  category: 'tone' | 'voice' | 'custom'
  language?: Language                     // only for voices
  url: string                             // resolved URL ready for new Audio(url)
}
```

Dependencies: none (no React, no Electron). Pure logic + HTMLAudioElement + Web Audio fallback. Easy to unit test.

### 5.2 `soundPresets.ts`

A static array of `SoundOption` metadata covering tones + voices. Used by `AlertSoundService.listAvailable` to populate the UI without hardcoding strings in components.

### 5.3 `customSoundStorage.ts` (renderer) + `customSoundIO.ts` (main)

- **Renderer**: thin wrapper that invokes IPC channels and returns typed results.
- **Main**:
  - Stores files under `app.getPath('userData')/custom-sounds/<uuid>.<ext>`.
  - Persists a `custom-sounds.json` index file: `{ id, originalName, ext, sizeBytes, addedAt }[]`.
  - Validates on save: extension ∈ {`.mp3`, `.wav`, `.ogg`}; MIME prefix `audio/`; size ≤ 5 MB; **sanitize filename** (UUID only, never trust user-supplied name on disk).
  - Exposes audio via a **registered `custom-sound://` protocol** (via `protocol.registerFileProtocol` in main) rather than raw `file://` URLs. Reason: Electron's renderer security model blocks direct `file://` access from `https://` or `http://`-loaded pages, and the custom protocol gives us a chokepoint to validate the requested `id` before resolving to disk.

New IPC channels (added to whitelists in `electron/preload/index.ts`):
- `custom-sound:list` — invoke, returns index.
- `custom-sound:add` — invoke, payload = `{ filename, bytes }`, returns new id.
- `custom-sound:delete` — invoke, payload = `id`, returns boolean.
- `custom-sound:resolve-url` — invoke, payload = `id`, returns playable URL.

### 5.4 `SettingsPanel.tsx` — new "Sound" sub-section

Add a **new dedicated "Sound" tab** to the existing settings tabs (`detection | habit | app | data` → `detection | habit | sound | app | data`). Rationale: the sound section is large (presets + voices + custom uploads + preview + volume) and would visually overwhelm the more compact "App" tab.

UI sketch:
```
┌─ Alert Sound ──────────────────────────────────┐
│  ○ Tones                                       │
│    ▶ Soft chime          [Preview]             │
│    ● Chime (default)     [Preview]             │
│    ○ Buzzer              [Preview]             │
│                                                │
│  ○ Voices (Russian)        [☐ All languages]   │
│    ○ Стоп, опусти руки   [Preview]             │
│                                                │
│  ○ Custom                                      │
│    ○ my-grandma.mp3      [Preview] [✕]         │
│    [+ Upload custom sound]                     │
│                                                │
│  Volume  ━━━━━━━━●━━━━━━  50%                  │
└────────────────────────────────────────────────┘
```

Behavior:
- Selecting an item updates `appSettings.alertSoundId`.
- Preview button calls `AlertSoundService.preview(id, volume)` — does not affect the active alert flow.
- "All languages" toggle reveals all voice presets, not just the ones matching the UI language.
- Upload button opens a file picker, validates, calls `custom-sound:add`, refreshes the list.

### 5.5 Type changes — `src/types/app-settings.ts`

```ts
export interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  hidePreview: boolean
  closeAction: 'ask' | 'quit' | 'tray'
  alertSoundId: string         // NEW — default: 'tone-chime'
  alertVolume: number          // NEW — 0.0–1.0, default 0.5
}
```

Existing users get the new defaults via the `{ ...DEFAULT_APP_SETTINGS, ...stored }` spread already present in `App.tsx:79`.

## 6. Data Flow

```
User touches face
  │
  ▼
useDetection emits ALERT
  │
  ▼
App.tsx handleAlert()
  │
  ├─ setShowAlert(true)
  ├─ IPC: show-fullscreen-alert
  ├─ new Notification(...)
  └─ alertSoundService.play(appSettings.alertSoundId, appSettings.alertVolume)
        │
        ├─ resolve soundId → URL
        │     ├─ preset?  → '/sounds/voice-ru-stop.mp3'
        │     └─ custom?  → IPC custom-sound:resolve-url
        │
        ├─ new Audio(url); audio.volume = volume; audio.play()
        └─ on error → existing Web Audio sine fallback
```

## 7. Aptabase Diagnostic Logging

Add to `electron/main/index.ts`:

```ts
console.log('[Aptabase] init', { host: '...', isPackaged: app.isPackaged })

// Wrap trackEvent in a small helper that logs failures:
async function trackAnalytics(name: string, props?: Record<string, string | number>) {
  try {
    await trackEvent(name, props)
    if (!app.isPackaged) console.log('[Aptabase] sent', name, props ?? '')
  } catch (err) {
    console.error('[Aptabase] failed', name, err)
  }
}
```

Replace direct `trackEvent` calls in `electron/main/index.ts` and `update.ts` with `trackAnalytics`.

Add a one-paragraph troubleshooting section to `README.md` covering: (1) confirm app key is registered in self-hosted dashboard, (2) check "Show Debug events" toggle, (3) verify SSL chain.

## 8. Testing Strategy

**Unit (vitest):**
- `AlertSoundService.test.ts` — preset lookup, fallback on play error, preview doesn't suppress.
- `customSoundStorage.test.ts` — file extension/MIME/size validation, filename sanitization.
- `soundPresets.test.ts` — every advertised preset has a corresponding file path (snapshot test).

**Integration (playwright e2e):**
- Open settings → switch sound to a voice preset → trigger alert → assert HTMLAudioElement created with expected `src`.
- Upload a small valid .mp3 → it appears in the list → select it → trigger alert.

**Manual smoke (each release):**
- Play one tone, one voice, one custom on each platform we ship (win, mac, linux).
- Confirm Aptabase debug logging appears in dev mode.

## 9. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TTS-generated voices sound robotic / wrong tone | Medium | Use a premium TTS (e.g. ElevenLabs); manually review each clip before commit. |
| Bundled audio bloats installer (10 voices × ~50 KB ≈ 500 KB) | Low | Acceptable. Keep clips ≤ 2 s, mono, 64 kbps mp3. |
| Custom file upload security (malicious filename, path traversal) | Medium | Reject all path separators; store under UUID; validate MIME and extension. |
| Custom file format unplayable on target platform | Low | HTML5 audio supports mp3/wav/ogg on all Electron-supported platforms. Document supported formats in UI hint. |
| `extraResources` path differs between dev and packaged runs | Medium | Test both. Confirm `process.env.VITE_PUBLIC` works for `/sounds/*.mp3` in renderer in both modes. |

## 10. Out of Scope (Future)

- Visual alert intensity options (flash, shake, etc.).
- Per-zone sounds (different sound for hair vs face).
- Vibration feedback on supporting hardware.
- A "Stop" button on the alert overlay that also silences the sound mid-playback.

---

## Acceptance Checklist

- [ ] `public/sounds/` populated with all listed clips, each ≤ 2 s.
- [ ] `AlertSoundService` unit-tested; fallback path covered.
- [ ] Settings panel lists presets, filters by language, supports custom upload + delete.
- [ ] `appSettings.alertSoundId` and `.alertVolume` persist across restarts.
- [ ] Trigger alert → selected sound plays; no console errors.
- [ ] Aptabase init logs appear in dev mode; failures logged.
- [ ] README troubleshooting section added.
