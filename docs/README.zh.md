# 别碰

**帮助改善拔毛症等触摸面部习惯的AI检测应用**

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Русский](README.ru.md)

---

## 简介

一款使用网络摄像头实时检测手部接近面部的桌面应用。通过视觉和音频警报帮助中断**拔毛症**（拔头发障碍）和**抠皮症**等重复性行为。

所有处理都在您的设备上本地进行。不收集或传输任何数据。

## 主要功能

- 基于MediaPipe的实时面部/手部检测
- 可自定义检测区域（头皮、眉毛、眼睛、脸颊等）
- 全屏警报+警告声
- 每日统计和连续天数追踪
- 内置呼吸冥想
- 系统托盘支持
- 多语言界面

## 安装

### 下载

从[Releases](https://github.com/writingdeveloper/dont-touch-electron/releases)页面下载最新版本。

### 从源码构建

```bash
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron
npm install
npm run dev      # 开发模式
npm run build    # 生产构建
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Electron + Vite |
| UI | React + TypeScript |
| 样式 | TailwindCSS |
| 检测 | MediaPipe Tasks Vision |
| 构建 | electron-builder |

## 隐私

- 所有视频处理在本地运行
- 图像或数据不会离开您的设备
- 符合GDPR、CCPA、PIPEDA

## 许可证

[MIT](../LICENSE)
