# 触らないで

**抜毛症などの顔タッチ習慣改善のためのAI検出アプリ**

[English](../README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

---

## 概要

ウェブカメラを使用して手が顔に近づくことをリアルタイムで検出するデスクトップアプリです。**抜毛症**（毛を引き抜く障害）や**皮膚むしり症**などの繰り返しの行動を、視覚・聴覚アラートで中断するのに役立ちます。

すべての処理はデバイス上でローカルに行われます。データの収集や送信はありません。

## 主な機能

- MediaPipeによるリアルタイム顔・手検出
- 検出ゾーンのカスタマイズ（頭皮、眉毛、目、頬など）
- フルスクリーンアラート＋警告音
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

- すべてのビデオ処理はローカルで実行
- 画像やデータがデバイスから出ることはありません
- GDPR、CCPA、PIPEDA準拠

## ライセンス

[MIT](../LICENSE)
