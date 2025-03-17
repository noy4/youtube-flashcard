# 依存ライブラリ

このプロジェクトで使用している主要な依存ライブラリの説明をまとめています。

## 本番環境の依存関係

### @commander-js/extra-typings

CLIアプリケーションを作成するためのライブラリです。TypeScript向けの型定義が強化されたCommanderのラッパーです。

参考プロジェクト：
- [Express CLI](https://github.com/expressjs/express/tree/master/bin)
- [Vue CLI](https://github.com/vuejs/vue-cli)

### youtube-dl-exec

YouTubeからビデオと字幕をダウンロードするためのライブラリです。yt-dlpの Node.js ラッパーです。

代替ライブラリ：
- [youtube-dl](https://github.com/ytdl-org/youtube-dl) - オリジナルのyt-dlプロジェクト
- [node-ytdl-core](https://github.com/fent/node-ytdl-core) - YouTube APIベースの実装

### subtitle

字幕ファイル（SRT形式）のパースと操作を行うためのライブラリです。

代替ライブラリ：
- [subtitles-parser](https://github.com/bazh/subtitles-parser)
- [node-srt](https://github.com/joshnuss/node-srt)

### openai

文字起こしと翻訳のためのOpenAI APIクライアントです。Whisper APIによる音声の文字起こしと、GPT-4による翻訳機能を提供します。

### yanki-connect

Ankiのフラッシュカードを管理するためのライブラリです。AnkiConnectのTypeScriptラッパーです。

代替ライブラリ：
- [anki-connect-js](https://github.com/FooSoft/anki-connect-js)
- [anki-api](https://github.com/kerrickstaley/anki-api)

## 開発環境の依存関係

### TypeScript

型安全な開発を可能にするJavaScriptのスーパーセットです。

### ESLint

コードの品質を保つための静的解析ツールです。

### ts-node

TypeScriptをNode.jsで直接実行するためのツールです。
