# 触らないで

**抜毛症などの顔タッチ習慣改善のためのAI検出アプリ**

[English](../README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

---

## 概要

ウェブカメラを使用して手が顔に近づくことをリアルタイムで検出するデスクトップアプリです。**抜毛症**（毛を引き抜く障害）や**皮膚むしり症**などの繰り返しの行動を、視覚・聴覚アラートで中断するのに役立ちます。

すべての映像処理はデバイス上でローカルに行われ、カメラ映像がデバイスから出ることはありません。アプリ改善のため、匿名の使用統計（個人情報・画像を除く）のみを収集します。

## 主な機能

- MediaPipeによるリアルタイム顔・手検出
- 検出ゾーンのカスタマイズ（頭皮、眉毛、目、頬など）
- フルスクリーンアラート＋カスタマイズ可能な通知音（内蔵トーン、多言語音声、自分の音声）
- 日次統計とストリーク追跡
- 内蔵呼吸瞑想
- システムトレイサポート
- 多言語UI

## インストール

### ダウンロード

[Releases](https://github.com/writingdeveloper/dont-touch-electron/releases)ページから最新バージョンをダウンロードしてください。

### ソースからビルド

```bash
git clone https://github.com/writingdeveloper/dont-touch-electron.git
cd dont-touch-electron
npm install
npm run dev      # 開発モード
npm run build    # プロダクションビルド
```

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Electron + Vite |
| UI | React + TypeScript |
| スタイリング | TailwindCSS |
| 検出 | MediaPipe Tasks Vision |
| ビルド | electron-builder |

## プライバシー

- すべての映像・画像処理はローカルで実行 — カメラ映像がデバイスから出ることはありません
- アプリ改善のため、匿名の使用統計（例：アプリ起動、検出開始/停止）のみを収集 — 個人情報・画像・映像は収集しません
- 分析データはGDPR、CCPA、PIPEDAに準拠して処理

## ライセンス

[MIT](../LICENSE)
