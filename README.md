# Don't Touch (Electron)

Face-touching detection app built with Electron + WebGPU + YOLO.

Helps people with trichotillomania (hair-pulling disorder) by detecting when their hand approaches their face/head and sending alerts.

## Features

- Real-time hand and face detection using YOLO
- WebGPU acceleration for fast inference (WASM fallback)
- System tray integration for background operation
- Desktop notifications
- Cross-platform (Windows, macOS, Linux)

## Tech Stack

- **Framework**: Electron + Vite (electron-vite-react template)
- **UI**: React + TypeScript + TailwindCSS
- **ML Runtime**: ONNX Runtime Web (WebGPU/WASM)
- **Detection**: YOLO pose estimation
- **Build**: Vite + electron-builder

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Build

```bash
# Build for current platform (creates installer)
npm run build

# Output: release/{version}/
```

## Project Structure

```
dont-touch-electron/
├── electron/              # Electron main & preload process
│   ├── main/
│   └── preload/
├── src/                   # React renderer
│   ├── components/
│   └── detection/         # YOLO detection module
│       ├── YoloDetector.ts
│       ├── ProximityAnalyzer.ts
│       └── types.ts
├── public/
│   └── models/            # ONNX models (download separately)
└── package.json
```

## Models

ONNX models are not included due to size. Download and place in `public/models/`:

1. **Hand Pose Model**: YOLO11n-pose trained on hand keypoints
2. **Body Pose Model**: YOLO26n-pose for head detection

## Legacy Version

The original Python version is archived at:
https://github.com/writingdeveloper/dont-touch-python

## License

MIT
