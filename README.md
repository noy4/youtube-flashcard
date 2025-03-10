# Flashcard converter

YouTube の字幕をフラッシュカードに変換するツール。

## 概要

- YouTubeの字幕を [Obsidian Spaced Repetition Plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition/) 形式のフラッシュカードに変換
- CLI版とブラウザ拡張版を提供

## 開発環境

- TypeScript
- Node.js

## 開発ガイド

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

- docs/todo.md を確認し、他ドキュメントを適宜更新しながら作業を進めること
- 作業完了時は必ず docs/todo.md を更新すること
- 新機能追加時は必ずドキュメントも更新すること

## ライセンス

MIT

## 依存ライブラリ

主要な依存ライブラリとその参考実装については [依存関係ドキュメント](docs/guide/dependencies.md) を参照してください。
