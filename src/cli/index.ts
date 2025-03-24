#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import pkgJson from '../../package.json' with { type: 'json' }
import { createFlashcards } from '../flashcard.js'

const program = new Command()
  .name('youtube-flashcard')
  .description('Generate flashcards from YouTube videos')
  .version(pkgJson.version)
  // input
  .argument('[video]', 'YouTube URL or path to video file', process.env.VIDEO)
  .argument('[subs1]', 'Path to subtitles file 1')
  .argument('[subs2]', 'Path to subtitles file 2')
  // languages
  .option('--from-lang <code>', 'Source language code', 'en')
  .option('--to-lang <code>', 'Target language code', 'ja')
  // anki
  .option('--add-to-anki', 'Add flashcards directly to Anki')
  .option('--deck-name <name>', 'Anki deck name')
  .option('--model-name <name>', 'Anki model name', 'Basic')
  // api
  .option('--openai-api-key <key>', 'OpenAI API key', process.env.OPENAI_API_KEY)
  .option('--translator-api-key <key>', 'Translator API key', process.env.TRANSLATOR_API_KEY)
  .option('--translator-base-url <url>', 'Translator API base URL', process.env.TRANSLATOR_BASE_URL)
  .option('--translator-model <model>', 'Translator API model', process.env.TRANSLATOR_MODEL || 'gpt-4o')
  // dev
  .option('--use-cache', 'Use cache')
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
