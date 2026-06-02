# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed
- **All analytics and telemetry.** Removed the Aptabase integration, the
  `track-event` IPC bridge, every renderer/main tracking call, and the
  "Send anonymous usage data" setting. The app now collects nothing and sends
  nothing off-device (aside from optional GitHub-hosted update checks). This
  also removes the hardcoded analytics endpoint from the codebase.

## [1.3.3] - 2026-05-29

### Added
- **Analytics opt-out** — a "Send anonymous usage data" toggle under Settings → App.
  Anonymous usage analytics stay on by default but can now be turned off; the
  toggle gates all analytics (both main-process and renderer events) and is
  localized in all six languages.

### Changed
- Upgraded the test toolchain (`vitest` 2 → 4), resolving the remaining moderate
  dev-dependency advisories (`esbuild` via `vite`); `npm audit` now reports zero
  vulnerabilities. No change to the shipped application.

## [1.3.2] - 2026-05-28

### Fixed
- **Startup auto-update**: an update detected during the splash screen was never
  surfaced, because the main window registers its update listener only after the
  splash finishes. The result is now cached in the main process and fetched on
  mount, so the update banner appears reliably.
- **System tray**: the "Start Detection" / "Stop Detection" menu items had no
  effect — the renderer never listened for the tray's `toggle-detection` event.
  They now start and stop detection as expected.
- **Statistics**: face-touch duration was under-reported because the detection
  start time was reset on every detection-zone change. Duration is now measured
  from when detection actually begins.
- **Settings**: a corrupt, partial, or older-schema `app-settings.json` could
  leave fields undefined and break the close / minimize-to-tray behavior. Loaded
  settings are now merged over defaults and type-coerced.
- **Diagnostics**: the `error_boundary_caught` analytics event is no longer
  dropped by the main-process event allow-list.

### Changed
- **Docs**: the privacy section now accurately states that anonymous usage
  analytics are collected (camera video and images never leave the device);
  corrected the Electron version badge; documented sound customization. Internal
  planning/spec artifacts were removed from the repository.

## [1.3.1] - 2026-05-28

### Fixed
- **Alert sounds**: in the packaged app every built-in tone and voice clip played
  the same fallback beep, because preset audio was loaded from an absolute
  `/sounds/` path that does not resolve under the `file://` protocol. Preset
  audio now uses a relative path and plays correctly. The notification icon had
  the same issue and was fixed too.
- **Auto-updater**: download listeners were re-registered on every download
  (accumulating duplicates) and a repeated initialization could crash on a
  duplicate IPC handler. Listeners and handlers are now wired exactly once.

### Changed
- **CI**: Dependabot pull requests are no longer blocked by the lockfile-change
  guard, so dependency security updates can flow again.
- **Dependencies**: applied non-breaking `npm audit` fixes to the build toolchain.

## [1.3.0] - 2026-05-28

### Added
- **Customizable alert sounds**: a library of selectable alerts — built-in tones,
  multilingual voice clips (generated via Microsoft Edge TTS), and user-uploaded
  audio — with volume control.
- Aptabase diagnostic logging for analytics troubleshooting.

[1.3.3]: https://github.com/writingdeveloper/dont-touch-electron/releases/tag/v1.3.3
[1.3.2]: https://github.com/writingdeveloper/dont-touch-electron/releases/tag/v1.3.2
[1.3.1]: https://github.com/writingdeveloper/dont-touch-electron/releases/tag/v1.3.1
[1.3.0]: https://github.com/writingdeveloper/dont-touch-electron/releases/tag/v1.3.0
