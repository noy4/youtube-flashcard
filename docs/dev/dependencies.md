# 依存ライブラリ

このプロジェクトで使用している主要な依存ライブラリの説明と使用例をまとめています。

## 本番環境の依存関係

### @commander-js/extra-typings

CLIアプリケーションを作成するためのライブラリです。TypeScript向けの型定義が強化されたCommanderのラッパーです。

```typescript
import { Command } from '@commander-js/extra-typings'

const program = new Command()
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version('1.0.0')
  .argument('[video]', 'ビデオファイルのパスまたはYouTube URL')
  .option('--from-lang <code>', '元の言語コード', 'en')
  .option('--to-lang <code>', '翻訳後の言語コード', 'ja')
```

参考プロジェクト：
- [Express CLI](https://github.com/expressjs/express/tree/master/bin)
- [Vue CLI](https://github.com/vuejs/vue-cli)

### youtube-dl-exec

YouTubeからビデオと字幕をダウンロードするためのライブラリです。yt-dlpの Node.js ラッパーです。

```typescript
import { youtubeDl } from 'youtube-dl-exec'

// ビデオ情報の取得
const info = await youtubeDl(url, {
  dumpJson: true,
})

// ビデオのダウンロード
await youtubeDl(url, {
  output: 'video.mp4',
  format: 'mp4',
})
```

代替ライブラリ：
- [youtube-dl](https://github.com/ytdl-org/youtube-dl) - オリジナルのyt-dlプロジェクト
- [node-ytdl-core](https://github.com/fent/node-ytdl-core) - YouTube APIベースの実装

### subtitle

字幕ファイル（SRT形式）のパースと操作を行うためのライブラリです。

```typescript
import { parseSync } from 'subtitle'

const subs = parseSync(srtContent)
  .filter(node => node.type === 'cue')
  .map(v => v.data)
```

代替ライブラリ：
- [subtitles-parser](https://github.com/bazh/subtitles-parser)
- [node-srt](https://github.com/joshnuss/node-srt)

### openai

文字起こしと翻訳のためのOpenAI APIクライアントです。

```typescript
import OpenAI from 'openai'

const client = new OpenAI({ apiKey })

// 音声ファイルの文字起こし
const transcription = await client.audio.transcriptions.create({
  model: 'whisper-1',
  file,
  language: 'en',
  response_format: 'srt',
})

// テキストの翻訳
const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: 'You are a skilled translator from en to ja.'
    },
    {
      role: 'user',
      content: textToTranslate
    }
  ]
})
```

### yanki-connect

Ankiのフラッシュカードを管理するためのライブラリです。AnkiConnectのTypeScriptラッパーです。

```typescript
import { YankiConnect } from 'yanki-connect'

const anki = new YankiConnect({ autoLaunch: true })

// デッキの作成
await anki.deck.createDeck({ deck: 'English Study' })

// ノートの追加
await anki.note.addNotes({
  notes: [{
    deckName: 'English Study',
    modelName: 'Basic',
    fields: {
      Front: '翻訳テキスト',
      Back: '元のテキスト',
    },
    tags: ['youtube-flashcard'],
    audio: [{
      filename: 'audio.mp3',
      data: audioBase64,
      fields: ['Back'],
    }],
  }],
})
```

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
