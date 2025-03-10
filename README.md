# Flashcard converter

YouTube の字幕をフラッシュカードに変換するツール。

## 機能

- YouTubeの字幕を [Obsidian Spaced Repetition Plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition/) 形式のフラッシュカードに変換
- 日英翻訳カード自動生成機能
- 複数の出力形式に対応

## インストール

```bash
npm install -g youtube-flashcard-converter
```

## 使い方

```bash
# 基本的な使い方
flashcard-convert <YouTube URL>

# オプション指定
flashcard-convert <YouTube URL> --format obsidian --translate
```

詳細なオプションについては[出力形式ドキュメント](docs/guide/output-format.md)を参照してください。

## 開発者向け

### 開発環境

- TypeScript
- Node.js

### コマンド

```bash
npm install        # セットアップ
npm test           # テスト実行
npm run docs:dev   # ドキュメント確認
```

## ライセンス

MIT
