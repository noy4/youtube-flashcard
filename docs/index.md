# Flashcard Converter

YouTubeの字幕からフラッシュカードを生成するツール

## 特徴

- YouTubeの字幕から簡単にフラッシュカードを作成
- [Obsidian Spaced Repetition Plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition/)形式で出力
- CLIとブラウザ拡張の2つの使用方法をサポート
- OpenAI APIを使用した自動翻訳機能

## インストール

### CLIのインストール

```bash
npm install -g youtube-flashcard-converter
```

### ブラウザ拡張のインストール

1. Chrome ウェブストアからインストール
2. 拡張機能の設定を行う（OpenAI APIキーの設定など）

## 使い方

### CLIを使う場合

基本的な使い方：
```bash
youtube-flashcard convert https://youtube.com/watch?v=xxxx
```

オプション指定：
```bash
youtube-flashcard convert https://youtube.com/watch?v=xxxx --language ja
```

### ブラウザ拡張を使う場合

1. YouTube動画ページにアクセス
2. 拡張機能のアイコンをクリック
3. 「フラッシュカードを生成」ボタンを押す
4. 生成されたフラッシュカードをコピーまたはダウンロード

## 詳細ガイド

より詳しい使い方については、以下のガイドを参照してください：

- [CLIの詳細な使い方](guide/cli.md)
- [ブラウザ拡張の使い方](guide/browser-extension.md)
- [OpenAI APIの設定方法](guide/openai-setup.md)
- [フラッシュカードの形式について](guide/flashcard-format.md)