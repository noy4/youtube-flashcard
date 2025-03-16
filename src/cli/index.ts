#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import packageJson from '../../package.json' with { type: 'json' }
import { createFlashcards } from '../flashcard.js'

const program = new Command()
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version)
  // input
  .argument('[video]', 'ビデオファイルのパスまたはYouTube URL', process.env.VIDEO)
  .argument('[subs1]', '字幕ファイル1のパス')
  .argument('[subs2]', '字幕ファイル2のパス')
  // languages
  .option('--from-lang <code>', '元の言語コード', 'en')
  .option('--to-lang <code>', '翻訳後の言語コード', 'ja')
  // anki
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'YouTube Flashcards')
  .option('--model-name <name>', 'Ankiのモデル名', 'Basic')
  // api
  .option('--api-key <key>', 'OpenAI APIキー', process.env.OPENAI_API_KEY)
  .action(async (video, subs1, subs2, options) => {
    try {
      await createFlashcards({
        input: video,
        subs1,
        subs2,
        ...options,
      })
    }
    catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
