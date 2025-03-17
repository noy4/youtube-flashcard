# Dependencies

このプロジェクトで使用している主要な依存ライブラリについてまとめる。
- 説明
- そのライブラリを使用しているメジャーなプロジェクト（ex.）
- その他候補ライブラリ（others:）

## Prod dependencies

### [commander](https://github.com/tj/commander.js)

CLIアプリケーションを作成するためのライブラリ。ex. [Vue CLI](https://github.com/vuejs/vue-cli), [sv - the Svelte CLI](https://github.com/sveltejs/cli/blob/main/packages/cli/bin.ts)

### [youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec)

YouTubeからビデオと字幕をダウンロードするためのライブラリ。`yt-dlp` の Node.js ラッパー。

### [subtitle](https://github.com/gsantiago/subtitle.js/)

字幕ファイル（SRT形式）の操作ライブラリ。others: [srt-parser-2](https://github.com/1c7/srt-parser-2)

### [openai](https://github.com/openai/openai-node)

OpenAI SDK。文字起こし、翻訳に使用。

### [yanki-connect](https://github.com/kitschpatrol/yanki-connect)

> A fully-typed Anki-Connect API client.

## Dev dependencies

### [TypeScript](https://github.com/microsoft/TypeScript)

### [ESLint](https://github.com/eslint/eslint)

With [@antfu/eslint-config](https://github.com/antfu/eslint-config)
