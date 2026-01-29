# Don't Touch 🛡️

<div align="center">

**AI-powered face-touch detection app for habit improvement**

[English](#english) | [한국어](#한국어) | [日本語](#日本語) | [中文](#中文) | [Español](#español) | [Русский](#русский)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision-green)](https://mediapipe.dev/)

</div>

---

## English

### Overview

**Don't Touch** is a desktop application that helps overcome face-touching habits such as **trichotillomania** (hair-pulling disorder) and **dermatillomania** (skin-picking disorder) through real-time AI detection.

The app uses your webcam to detect when your hand approaches your face and provides immediate alerts to help break the habit pattern.

### Features

- **Real-time Detection**: Face and hand landmark detection using MediaPipe
- **Customizable Zones**: Select specific areas to monitor (scalp, eyebrows, eyes, nose, cheeks, mouth, chin, ears)
- **Smart Alerts**: Full-screen warning with sound when face-touching is detected
- **Statistics Tracking**: Daily touch count, streak tracking, and monthly calendar view
- **Guided Meditation**: Built-in breathing exercises (Box breathing, 4-7-8 technique)
- **Multi-language Support**: English, Korean, Japanese, Chinese, Spanish, Russian
- **System Tray**: Runs quietly in the background
- **Privacy-First**: All processing happens locally - no data leaves your device

### Privacy

- **Local Processing Only** - All video analysis happens on your device
- **No Data Collection** - No images, videos, or personal data are stored or transmitted
- **GDPR/CCPA/PIPEDA Compliant** - Meets international privacy regulations

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Electron 33 + Vite |
| UI | React 18 + TypeScript |
| Styling | TailwindCSS |
| ML | MediaPipe Tasks Vision (Face & Hand Landmarker) |
| Build | electron-builder |

### Installation

#### Download

Download the latest release from the [Releases](https://github.com/writingdeveloper/dont-touch-electron/releases) page.

#### Development Setup

```bash
# Clone the repository
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Project Structure

```
dont-touch-electron/
├── electron/                 # Electron main & preload
│   ├── main/index.ts        # Main process, window management, tray
│   └── preload/index.ts     # IPC bridge
├── src/
│   ├── components/          # React components
│   │   ├── VideoPreview.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── DailyStatsCard.tsx
│   │   ├── MeditationModal.tsx
│   │   ├── CalendarView.tsx
│   │   └── AboutModal.tsx
│   ├── detection/           # AI detection module
│   │   ├── MediaPipeDetector.ts
│   │   └── ProximityAnalyzer.ts
│   ├── hooks/               # React hooks
│   │   ├── useDetection.ts
│   │   ├── useCamera.ts
│   │   └── useStatistics.ts
│   ├── i18n/                # Internationalization
│   │   ├── translations.ts
│   │   └── LanguageContext.tsx
│   ├── services/            # Business logic
│   │   └── StatisticsService.ts
│   └── App.tsx              # Main app component
└── package.json
```

### License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 한국어

### 개요

**손대지마**는 **발모벽**(머리카락 뽑기 장애) 및 **피부뜯기 장애** 등의 얼굴 터치 습관을 실시간 AI 감지를 통해 개선할 수 있도록 도와주는 데스크톱 애플리케이션입니다.

웹캠을 사용하여 손이 얼굴에 가까워지는 것을 감지하고 즉각적인 알림을 제공하여 습관 패턴을 끊는 데 도움을 줍니다.

### 주요 기능

- **실시간 감지**: MediaPipe를 활용한 얼굴 및 손 랜드마크 감지
- **맞춤형 영역 설정**: 감지할 특정 영역 선택 (두피, 눈썹, 눈, 코, 볼, 입, 턱, 귀)
- **스마트 알림**: 얼굴 터치 감지 시 전체 화면 경고 및 소리 알림
- **통계 추적**: 일일 터치 횟수, 스트릭 추적, 월별 달력 보기
- **명상 가이드**: 내장 호흡 운동 (박스 호흡, 4-7-8 기법)
- **다국어 지원**: 영어, 한국어, 일본어, 중국어, 스페인어, 러시아어
- **시스템 트레이**: 백그라운드에서 조용히 실행
- **개인정보 보호**: 모든 처리는 로컬에서 수행 - 데이터가 기기를 벗어나지 않음

### 개인정보 보호

- **로컬 처리만** - 모든 영상 분석은 사용자 기기에서 수행
- **데이터 수집 없음** - 이미지, 영상, 개인 데이터를 저장하거나 전송하지 않음
- **GDPR/CCPA/PIPEDA 준수** - 국제 개인정보보호 규정 충족

### 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Electron 33 + Vite |
| UI | React 18 + TypeScript |
| 스타일링 | TailwindCSS |
| ML | MediaPipe Tasks Vision (Face & Hand Landmarker) |
| 빌드 | electron-builder |

### 설치

#### 다운로드

[Releases](https://github.com/writingdeveloper/dont-touch-electron/releases) 페이지에서 최신 버전을 다운로드하세요.

#### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build
```

### 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 日本語

### 概要

**触らないで**は、**抜毛症**（毛を引き抜く障害）や**皮膚むしり症**などの顔を触る習慣を、リアルタイムAI検出により改善するためのデスクトップアプリケーションです。

ウェブカメラを使用して手が顔に近づくことを検出し、即座にアラートを提供して習慣パターンを断つお手伝いをします。

### 主な機能

- **リアルタイム検出**: MediaPipeを使用した顔と手のランドマーク検出
- **カスタマイズ可能なゾーン**: 監視する特定の領域を選択（頭皮、眉毛、目、鼻、頬、口、顎、耳）
- **スマートアラート**: 顔タッチ検出時に全画面警告とサウンド
- **統計トラッキング**: 日次タッチ回数、ストリーク追跡、月間カレンダービュー
- **瞑想ガイド**: 内蔵呼吸エクササイズ（ボックス呼吸、4-7-8テクニック）
- **多言語サポート**: 英語、韓国語、日本語、中国語、スペイン語、ロシア語
- **システムトレイ**: バックグラウンドで静かに実行
- **プライバシー優先**: すべての処理はローカルで実行 - データがデバイスから出ることはありません

### プライバシー

- **ローカル処理のみ** - すべてのビデオ分析はデバイス上で実行
- **データ収集なし** - 画像、ビデオ、個人データは保存・送信されません
- **GDPR/CCPA/PIPEDA準拠** - 国際的なプライバシー規制に対応

### 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Electron 33 + Vite |
| UI | React 18 + TypeScript |
| スタイリング | TailwindCSS |
| ML | MediaPipe Tasks Vision (Face & Hand Landmarker) |
| ビルド | electron-builder |

### インストール

#### ダウンロード

[Releases](https://github.com/writingdeveloper/dont-touch-electron/releases)ページから最新バージョンをダウンロードしてください。

#### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron

# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# プロダクションビルド
npm run build
```

### ライセンス

MITライセンス - 詳細は[LICENSE](LICENSE)ファイルをご覧ください。

---

## 中文

### 概述

**别碰**是一款桌面应用程序，通过实时AI检测帮助改善**拔毛症**（拔头发障碍）和**抠皮症**等触摸面部的习惯。

该应用使用网络摄像头检测手部接近面部的动作，并提供即时警报，帮助打破习惯模式。

### 主要功能

- **实时检测**: 使用MediaPipe进行面部和手部标记检测
- **可自定义区域**: 选择要监控的特定区域（头皮、眉毛、眼睛、鼻子、脸颊、嘴巴、下巴、耳朵）
- **智能警报**: 检测到触摸面部时全屏警告和声音提示
- **统计跟踪**: 每日触摸次数、连续天数跟踪、月度日历视图
- **冥想指导**: 内置呼吸练习（方块呼吸、4-7-8技巧）
- **多语言支持**: 英语、韩语、日语、中文、西班牙语、俄语
- **系统托盘**: 在后台安静运行
- **隐私优先**: 所有处理都在本地进行 - 数据不会离开您的设备

### 隐私保护

- **仅本地处理** - 所有视频分析都在您的设备上进行
- **不收集数据** - 不存储或传输任何图像、视频或个人数据
- **符合GDPR/CCPA/PIPEDA** - 满足国际隐私法规要求

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Electron 33 + Vite |
| UI | React 18 + TypeScript |
| 样式 | TailwindCSS |
| ML | MediaPipe Tasks Vision (Face & Hand Landmarker) |
| 构建 | electron-builder |

### 安装

#### 下载

从[Releases](https://github.com/writingdeveloper/dont-touch-electron/releases)页面下载最新版本。

#### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron

# 安装依赖
npm install

# 以开发模式运行
npm run dev

# 生产构建
npm run build
```

### 许可证

MIT许可证 - 详情请参阅[LICENSE](LICENSE)文件。

---

## Español

### Descripción

**No Toques** es una aplicación de escritorio que ayuda a superar hábitos de tocarse la cara como la **tricotilomanía** (trastorno de arrancarse el pelo) y la **dermatilomanía** (trastorno de rascarse la piel) mediante detección de IA en tiempo real.

La aplicación usa tu cámara web para detectar cuando tu mano se acerca a tu cara y proporciona alertas inmediatas para ayudar a romper el patrón de hábito.

### Características

- **Detección en Tiempo Real**: Detección de puntos de referencia faciales y de manos usando MediaPipe
- **Zonas Personalizables**: Selecciona áreas específicas para monitorear (cuero cabelludo, cejas, ojos, nariz, mejillas, boca, mentón, orejas)
- **Alertas Inteligentes**: Advertencia en pantalla completa con sonido cuando se detecta el toque facial
- **Seguimiento de Estadísticas**: Conteo diario de toques, seguimiento de rachas y vista de calendario mensual
- **Meditación Guiada**: Ejercicios de respiración integrados (respiración cuadrada, técnica 4-7-8)
- **Soporte Multiidioma**: Inglés, coreano, japonés, chino, español, ruso
- **Bandeja del Sistema**: Se ejecuta silenciosamente en segundo plano
- **Privacidad Primero**: Todo el procesamiento ocurre localmente - ningún dato sale de tu dispositivo

### Privacidad

- **Solo Procesamiento Local** - Todo el análisis de video ocurre en tu dispositivo
- **Sin Recopilación de Datos** - No se almacenan ni transmiten imágenes, videos o datos personales
- **Cumple con GDPR/CCPA/PIPEDA** - Cumple con las regulaciones internacionales de privacidad

### Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | Electron 33 + Vite |
| UI | React 18 + TypeScript |
| Estilos | TailwindCSS |
| ML | MediaPipe Tasks Vision (Face & Hand Landmarker) |
| Build | electron-builder |

### Instalación

#### Descarga

Descarga la última versión desde la página de [Releases](https://github.com/writingdeveloper/dont-touch-electron/releases).

#### Configuración de Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

### Licencia

Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## Русский

### Обзор

**Не трогай** — это настольное приложение, которое помогает преодолеть привычку касаться лица, такую как **трихотилломания** (расстройство выдергивания волос) и **дерматилломания** (расстройство ковыряния кожи), с помощью обнаружения ИИ в реальном времени.

Приложение использует вашу веб-камеру для обнаружения приближения руки к лицу и предоставляет немедленные оповещения, помогая разорвать паттерн привычки.

### Функции

- **Обнаружение в реальном времени**: Обнаружение ориентиров лица и рук с помощью MediaPipe
- **Настраиваемые зоны**: Выбор конкретных областей для мониторинга (кожа головы, брови, глаза, нос, щёки, рот, подбородок, уши)
- **Умные оповещения**: Полноэкранное предупреждение со звуком при обнаружении касания лица
- **Отслеживание статистики**: Ежедневный подсчёт касаний, отслеживание серий, месячный календарь
- **Управляемая медитация**: Встроенные дыхательные упражнения (квадратное дыхание, техника 4-7-8)
- **Многоязычная поддержка**: Английский, корейский, японский, китайский, испанский, русский
- **Системный трей**: Тихо работает в фоновом режиме
- **Приватность прежде всего**: Вся обработка происходит локально — данные не покидают ваше устройство

### Конфиденциальность

- **Только локальная обработка** — Весь анализ видео происходит на вашем устройстве
- **Сбор данных отсутствует** — Изображения, видео или персональные данные не сохраняются и не передаются
- **Соответствует GDPR/CCPA/PIPEDA** — Соответствует международным правилам конфиденциальности

### Технологический стек

| Категория | Технология |
|-----------|------------|
| Фреймворк | Electron 33 + Vite |
| UI | React 18 + TypeScript |
| Стили | TailwindCSS |
| ML | MediaPipe Tasks Vision (Face & Hand Landmarker) |
| Сборка | electron-builder |

### Установка

#### Загрузка

Загрузите последнюю версию со страницы [Releases](https://github.com/writingdeveloper/dont-touch-electron/releases).

#### Настройка для разработки

```bash
# Клонировать репозиторий
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron

# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev

# Собрать для продакшена
npm run build
```

### Лицензия

Лицензия MIT — подробности смотрите в файле [LICENSE](LICENSE).

---

<div align="center">

**Made with ❤️ for better habits**

[Report Bug](https://github.com/writingdeveloper/dont-touch-electron/issues) · [Request Feature](https://github.com/writingdeveloper/dont-touch-electron/issues)

</div>
