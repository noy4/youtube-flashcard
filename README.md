# YouTube Flashcard

YouTubeの字幕から英語学習用のフラッシュカードを生成するCLIツール。

## 機能

- YouTubeビデオの字幕を自動で文字起こし
- 文字起こしから翻訳カードを自動生成
- 音声セグメントの自動抽出
- Ankiへのフラッシュカード直接追加

## インストール

```bash
npm install -g youtube-flashcard
```

## 使い方

### 基本的な使い方

```bash
# YouTubeビデオから字幕を自動生成してフラッシュカードを作成
youtube-flashcard "https://www.youtube.com/watch?v=..."

# 既存の字幕ファイルを使用
youtube-flashcard "video.mp4" "subs1.srt" "subs2.srt"
```

### オプション

```bash
# 言語の指定（デフォルト: en -> ja）
youtube-flashcard ... --from-lang en --to-lang ja

# フラッシュカードをAnkiへ直接追加
youtube-flashcard ... --add-to-anki --deck-name "英語学習" --model-name "Basic"
```

### 環境変数

以下の環境変数でデフォルト値を設定できます：

- `VIDEO`: デフォルトのビデオパスまたはURL
- `OPENAI_API_KEY`: OpenAI APIキー（文字起こし・翻訳に必要）

## 開発者向け

### 開発環境

- TypeScript
- Node.js

### 必要なツール

- OpenAI API: 文字起こしと翻訳に使用
- FFmpeg: 音声セグメントの抽出に使用
- Anki: フラッシュカードの追加に必要（--add-to-ankiオプション使用時）

### コマンド

```bash
npm install   # セットアップ
npm test      # テスト実行
```

## ライセンス

MIT
