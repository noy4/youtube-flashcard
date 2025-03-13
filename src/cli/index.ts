#!/usr/bin/env node

import type { OutputFormat } from '../types.js'
import { Command } from '@commander-js/extra-typings'
import packageJson from '../../package.json' with { type: 'json' }
import { FlashcardGenerator } from '../generator.js'
import { OutputManager } from '../output.js'

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
  .option('-f, --from-lang <code>', '元の言語コード', 'en')
  .option('-t, --to-lang <code>', '翻訳後の言語コード', 'ja')
  // anki
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'Default')
  .option('--model-name <name>', 'Ankiのモデル名', '基本')
  // api
  .option('--api-key <key>', 'OpenAI APIキー', process.env.OPENAI_API_KEY)
  .option('-b, --base-url <url>', 'API baseURL', process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1')
  .option('-m, --model <model>', 'AIモデル', process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free')
  .action(async (url, options) => {
    try {
      const generator = new FlashcardGenerator()
      const flashcards = await generator.generate({
        url,
        input: options.input,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        model: options.model,
        fromLang: options.fromLang,
        toLang: options.toLang,
      })

      const outputManager = new OutputManager(flashcards)
      await outputManager.output({
        format: options.format as OutputFormat,
        filePath: options.output,
        anki: options.addToAnki
          ? {
              enabled: true,
              deckName: options.deckName,
              modelName: options.modelName,
            }
          : undefined,
      })
    }
    catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
