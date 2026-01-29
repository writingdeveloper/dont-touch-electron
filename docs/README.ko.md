# 손대지마

**발모벽 등 얼굴 터치 습관 개선을 위한 AI 감지 앱**

[English](../README.md) | [日本語](README.ja.md) | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

---

## 소개

웹캠을 사용하여 손이 얼굴에 가까워지는 것을 실시간으로 감지하는 데스크톱 앱입니다. **발모벽**(머리카락 뽑기 장애)이나 **피부뜯기 장애** 같은 반복적인 행동을 시각/청각 알림으로 끊는 데 도움을 줍니다.

모든 처리는 사용자 기기에서 로컬로 수행됩니다. 데이터가 수집되거나 전송되지 않습니다.

## 주요 기능

- MediaPipe 기반 실시간 얼굴/손 감지
- 감지 영역 설정 (두피, 눈썹, 눈, 볼 등)
- 전체 화면 알림 + 경고음
- 일일 통계 및 스트릭 추적
- 내장 호흡 명상
- 시스템 트레이 지원
- 다국어 UI

## 설치

### 다운로드

[Releases](https://github.com/writingdeveloper/dont-touch-electron/releases) 페이지에서 최신 버전을 다운로드하세요.

### 소스에서 빌드

```bash
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron
npm install
npm run dev      # 개발 모드
npm run build    # 프로덕션 빌드
```

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Electron + Vite |
| UI | React + TypeScript |
| 스타일링 | TailwindCSS |
| 감지 | MediaPipe Tasks Vision |
| 빌드 | electron-builder |

## 개인정보 보호

- 모든 영상 처리는 로컬에서 수행
- 이미지나 데이터가 기기를 벗어나지 않음
- GDPR, CCPA, PIPEDA 준수

## 라이선스

[MIT](../LICENSE)
