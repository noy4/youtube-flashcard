#!/usr/bin/env node

import type { Flashcard, OutputFormat } from '../types.js'
import { readFileSync, writeFileSync } from 'node:fs'
import { Command } from 'commander'
import packageJson from '../../package.json' with { type: 'json' }
import { AnkiConnector } from '../anki.js'
import { SubtitleConverter } from '../converter.js'
import { FlashcardFormatter } from '../formatter.js'
import { extractVideoId, fetchSubtitles } from '../youtube.js'

// メインロジックを担当するクラス
class FlashcardGenerator {
  private async generateFromUrl(url: string, options: {
    apiKey: string
    baseUrl?: string
    model?: string
    sourceLang: string
    targetLang: string
  }) {
    const subtitles = await fetchSubtitles(url, options.sourceLang)
    const videoId = extractVideoId(url)
    const converter = new SubtitleConverter(subtitles, videoId, {
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
      model: options.model,
    })
    return await converter.convert(options.sourceLang, options.targetLang)
  }

  private loadFromJson(path: string): Flashcard[] {
    const jsonContent = readFileSync(path, 'utf8')
    return JSON.parse(jsonContent)
  }

  async generate(options: {
    url?: string
    input?: string
    apiKey?: string
    baseUrl?: string
    model?: string
    sourceLang: string
    targetLang: string
  }): Promise<Flashcard[]> {
    if (options.input)
      return this.loadFromJson(options.input)

    if (!options.url)
      throw new Error('動画URLを指定してください')

    if (!options.apiKey)
      throw new Error('OpenAI APIキーを指定してください')

    return await this.generateFromUrl(options.url, {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      model: options.model,
      sourceLang: options.sourceLang,
      targetLang: options.targetLang,
    })
  }
}

// エラーハンドリング
function handleError(error: unknown) {
  if (error instanceof Error)
    console.error('エラーが発生しました:', error.message)
  else
    console.error('予期せぬエラーが発生しました')

  process.exit(1)
}

const program = new Command()

program
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version)

program
  // input
  .argument('[url]', 'YouTube動画のURL', process.env.VIDEO_URL)
  .option('-i, --input <path>', '既存のJSONファイルパス（指定時は字幕取得とフラッシュカード生成をスキップ）')

  // output
  .option('-f, --format <format>', '出力形式 (json, obsidian または anki)', 'json')
  .option('-o, --output <path>', '出力ファイルパス', 'output/json.json')

  // languages
  .option('-s, --source-lang <code>', '元の言語コード', 'en')
  .option('-t, --target-lang <code>', '翻訳後の言語コード', 'ja')

  // anki
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'Default')
  .option('--model-name <name>', 'Ankiのモデル名', '基本')

  // api
  .option('--api-key <key>', 'OpenAI APIキー', process.env.OPENAI_API_KEY)
  .option('-m, --model <model>', 'AIモデル')
  .option('-b, --base-url <url>', 'API baseURL')

  .action(async (url: string | undefined, options: {
    input?: string
    format: OutputFormat
    output: string
    sourceLang: string
    targetLang: string
    addToAnki?: boolean
    deckName: string
    modelName: string
    apiKey?: string
    model?: string
    baseUrl?: string
  }) => {
    try {
      const generator = new FlashcardGenerator()
      const flashcards = await generator.generate({
        url,
        input: options.input,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        model: options.model,
        sourceLang: options.sourceLang,
        targetLang: options.targetLang,
      })

      if (options.addToAnki) {
        const ankiConnector = new AnkiConnector()
        const noteIds = await ankiConnector.addCards(flashcards, options.deckName, options.modelName)
        console.log(`${noteIds.length}枚のフラッシュカードをAnkiに追加しました`)
        console.log(`デッキ名: ${options.deckName}`)
      }

      const output = FlashcardFormatter.toString(flashcards, options.format)
      writeFileSync(options.output, output, 'utf8')
      console.log(`フラッシュカードを ${options.output} に保存しました（形式: ${options.format}）`)
    }
    catch (error) {
      handleError(error)
    }
  })

program.parse()
