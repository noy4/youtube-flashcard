# Flashcard converter

YouTube の字幕をフラッシュカードに変換するツール。

## 概要

- YouTubeの字幕を [Obsidian Spaced Repetition Plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition/) 形式のフラッシュカードに変換
- オフラインでの変換に対応
- 日英翻訳カード自動生成機能
- 複数の出力形式に対応

## インストール

```bash
npm install -g youtube-flashcard-converter
```

## 使い方

### CLI版

```bash
# 基本的な使い方
flashcard-convert <YouTube URL>

# オプション指定
flashcard-convert <YouTube URL> --format obsidian --translate
```

詳細なオプションについては[出力形式ドキュメント](docs/guide/output-format.md)を参照してください。

### ブラウザ拡張版

1. Chrome Web Storeからインストール（準備中）
2. YouTubeの動画ページで拡張機能のアイコンをクリック
3. 変換設定を選択して実行

## 開発者向け情報

### 開発環境

- TypeScript
- Node.js

### セットアップ

```bash
npm install
```

### テスト実行

```bash
npm test
```

### ビルド

```bash
npm run build
```

## ドキュメント

ドキュメントは VitePress を使用して作成しています。
https://vitepress.dev/guide/getting-started

### ドキュメントの確認

```bash
npm run docs:dev
```

### ドキュメント更新ルール

- タスク開始前に必ず docs/todo.md を確認し、作業内容に関連するタスクの有無を確認すること
- タスク実行前に docs/todo.md を必要に応じて編集し、作業内容を記載すること
- docs/todo.md を確認し、他ドキュメントを適宜更新しながら作業を進めること
- 作業完了時は必ず docs/todo.md を更新すること
- 新機能追加時は必ずドキュメントも更新すること

## 依存ライブラリ

主要な依存ライブラリとその参考実装については [依存関係ドキュメント](docs/guide/dependencies.md) を参照してください。

## ライセンス

MIT
