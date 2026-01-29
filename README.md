# Don't Touch

**Face-touch detection app to help overcome habits like trichotillomania**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-35-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision-green)](https://mediapipe.dev/)

[한국어](docs/README.ko.md) | [日本語](docs/README.ja.md) | [中文](docs/README.zh.md) | [Español](docs/README.es.md) | [Русский](docs/README.ru.md)

---

## What is this?

A desktop app that uses your webcam to detect when your hand approaches your face. It helps break repetitive behaviors like **trichotillomania** (hair-pulling) and **dermatillomania** (skin-picking) by providing immediate visual and audio alerts.

All processing happens locally on your device. No data is collected or transmitted.

## Features

- Real-time face and hand detection via MediaPipe
- Customizable detection zones (scalp, eyebrows, eyes, cheeks, etc.)
- Full-screen alerts with sound
- Daily statistics and streak tracking
- Built-in breathing exercises
- System tray support
- Multi-language UI

## Quick Start

### Download

Get the latest release from [Releases](https://github.com/writingdeveloper/dont-touch-electron/releases).

### Build from source

```bash
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron
npm install
npm run dev      # Development
npm run build    # Production build
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Electron + Vite |
| UI | React + TypeScript |
| Styling | TailwindCSS |
| Detection | MediaPipe Tasks Vision |
| Build | electron-builder |

## Project Structure

```
├── electron/          # Main process & preload
├── src/
│   ├── components/    # React UI components
│   ├── detection/     # MediaPipe integration
│   ├── hooks/         # React hooks
│   ├── i18n/          # Translations
│   └── services/      # Business logic
└── docs/              # Documentation & translations
```

## Privacy

- All video processing runs locally
- No images or data leave your device
- GDPR, CCPA, PIPEDA compliant

## Contributing

Issues and pull requests are welcome.

## License

[MIT](LICENSE)
