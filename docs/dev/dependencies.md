# 依存ライブラリ

このプロジェクトで使用している主要な依存ライブラリの説明と使用例をまとめています。

## 本番環境の依存関係

### commander

CLIアプリケーションを作成するためのライブラリです。コマンドライン引数のパース、オプションの定義、ヘルプメッセージの生成などの機能を提供します。

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成するツール')
  .version('1.0.0')
  .option('-l, --lang <language>', '字幕の言語を指定', 'en')
  .argument('<url>', 'YouTubeのURL')
  .action(async (url, options) => {
    // コマンド実行時の処理
  });

program.parse();
```

参考プロジェクト：
- [Express CLI](https://github.com/expressjs/express/tree/master/bin) - Expressフレームワークのコマンドラインツール
- [Vue CLI](https://github.com/vuejs/vue-cli) - Vue.jsの開発ツール

### openai

OpenAI APIを使用して、字幕の翻訳を行うためのライブラリです。

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function translateText(text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful translator."
      },
      {
        role: "user",
        content: `Translate the following text to Japanese: ${text}`
      }
    ]
  });

  return completion.choices[0].message.content || '';
}
```

参考プロジェクト：
- [ChatGPT CLI](https://github.com/j178/chatgpt) - OpenAI APIを使用したCLIチャットツール
- [GitHub Copilot CLI](https://github.com/github/gh-copilot) - GitHubのAIアシスタントツール

### youtube-caption-extractor

YouTubeの字幕を抽出するためのライブラリです。

```typescript
import { extractCaptions } from 'youtube-caption-extractor';

async function getCaptions(url: string, lang: string = 'en'): Promise<string[]> {
  const captions = await extractCaptions(url, {
    language: lang
  });

  return captions.map(caption => caption.text);
}
```

参考プロジェクト：
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) - YouTubeの字幕を取得するPythonライブラリ
- [youtube-captions-scraper](https://github.com/algolia/youtube-captions-scraper) - YouTubeの字幕をスクレイピングするNode.jsライブラリ

## 開発環境の依存関係

### TypeScript

型安全な開発を可能にするJavaScriptのスーパーセットです。

### Vitest

高速な単体テストフレームワークです。Jest互換のAPIを提供しながら、Viteのビルドパイプラインを活用します。

### VitePress

Vue.js製の静的サイトジェネレーターで、このプロジェクトのドキュメントを生成するために使用しています。