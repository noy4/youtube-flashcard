# Dependencies

このプロジェクトで使用している主要な依存ライブラリについてまとめる。
- 説明
- そのライブラリを使用しているメジャーなプロジェクト（ex.）
- その他候補ライブラリ（others:）

## Prod dependencies

### commander

CLIアプリケーションを作成するためのライブラリ。ex. [Vue CLI](https://github.com/vuejs/vue-cli), [sv - the Svelte CLI](https://github.com/sveltejs/cli/blob/main/packages/cli/bin.ts)

### youtube-dl-exec

YouTubeからビデオと字幕をダウンロードするためのライブラリ。`yt-dlp` の Node.js ラッパー。

### subtitle

字幕ファイル（SRT形式）の操作ライブラリ。others: [srt-parser-2](https://github.com/1c7/srt-parser-2)

### openai

OpenAI SDK。文字起こし、翻訳に使用。

### yanki-connect

> A fully-typed Anki-Connect API client.

## Dev dependencies

### TypeScript

### ESLint

With [@antfu/eslint-config](https://github.com/antfu/eslint-config)
