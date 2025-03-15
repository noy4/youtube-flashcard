#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import packageJson from '../../package.json' with { type: 'json' }
import { createFlashcards } from '../flashcard.js'

const program = new Command()
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version)
  // input
  .argument('<video>', 'ビデオファイルのパス')
  .argument('[srt1]', '字幕ファイル1のパス')
  .argument('[srt2]', '字幕ファイル2のパス')
  .option('-o, --output <path>', '出力ファイルパス', 'output/json.json')
  .option('-f, --format <format>', '出力形式 (json, obsidian または anki)', 'json')
  // languages
  .option('--from-lang <code>', '元の言語コード', 'en')
  .option('--to-lang <code>', '翻訳後の言語コード', 'ja')
  // anki
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'Default')
  .option('--model-name <name>', 'Ankiのモデル名', '基本')
  // api
  .option('--api-key <key>', 'OpenAI APIキー', process.env.OPENAI_API_KEY)
  .option('-b, --base-url <url>', 'API baseURL', process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1')
  .option('-m, --model <model>', 'AIモデル', process.env.AI_MODEL || 'google/gemini-flash-1.5-8b')
  .action(async (video, srt1, srt2, options) => {
    try {
      await createFlashcards({
        input: video,
        subs1: srt1,
        subs2: srt2,
        ...options,
      })
    }
    catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
