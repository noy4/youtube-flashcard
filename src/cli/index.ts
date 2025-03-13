#!/usr/bin/env node

import type { Flashcard, OutputFormat } from '../types.js'
import { readFileSync } from 'node:fs'
import { Command } from 'commander'
import packageJson from '../../package.json' with { type: 'json' }
import { SubtitleConverter } from '../converter.js'
import { OutputManager } from '../output.js'
import { extractVideoId, fetchSubtitles } from '../youtube.js'

interface CliOptions {
  input?: string
  output: string
  format: OutputFormat
  sourceLang: string
  targetLang: string
  addToAnki?: boolean
  deckName: string
  modelName: string
  apiKey?: string
  baseUrl?: string
  model: string
}

class FlashcardGenerator {
  private async generateFromUrl(url: string, options: {
    apiKey: string
    baseUrl?: string
    model: string
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
    model: string
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

const program = new Command()
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version)
  // input/output
  .argument('[url]', 'YouTube動画のURL', process.env.VIDEO_URL)
  .option('-i, --input <path>', '既存のJSONファイルパス（指定時は字幕取得とフラッシュカード生成をスキップ）')
  .option('-o, --output <path>', '出力ファイルパス', 'output/json.json')
  .option('-f, --format <format>', '出力形式 (json, obsidian または anki)', 'json')
  // languages
  .option('-s, --source-lang <code>', '元の言語コード', 'en')
  .option('-t, --target-lang <code>', '翻訳後の言語コード', 'ja')
  // anki
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'Default')
  .option('--model-name <name>', 'Ankiのモデル名', '基本')
  // api
  .option('--api-key <key>', 'OpenAI APIキー', process.env.OPENAI_API_KEY)
  .option('-b, --base-url <url>', 'API baseURL', process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1')
  .option('-m, --model <model>', 'AIモデル', process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free')
  .action(async (url: string | undefined, options: CliOptions) => {
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

    const outputManager = new OutputManager(flashcards)
    await outputManager.output({
      format: options.format,
      filePath: options.output,
      anki: options.addToAnki
        ? {
            enabled: true,
            deckName: options.deckName,
            modelName: options.modelName,
          }
        : undefined,
    })
  })

program.parse()
