#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import * as dotenv from '@dotenvx/dotenvx'
import pkgJson from '../../package.json' with { type: 'json' }
import { createFlashcards } from '../flashcard.js'

dotenv.config()

const program = new Command()
  .name('youtube-flashcard')
  .description('Generate flashcards from YouTube videos')
  .version(pkgJson.version)
  // input
  .argument('[video]', 'YouTube URL or path to video file', process.env.VIDEO)
  .argument('[target.srt]', 'Path to subtitles file with target language')
  .argument('[native.srt]', 'Path to subtitles file with native language')
  // languages
  .option('--target-lang <code>', 'Target language code', 'en')
  .option('--native-lang <code>', 'Native language code', 'ja')
  // output
  .option('--transcribe-only', 'Only transcribe the video')
  .option('--format <format>', 'Output format', 'anki')
  .option('--deck-name <name>', 'Anki deck name')
  .option('--model-name <name>', 'Anki model name', 'Basic')
  // api
  .option('--openai-api-key <key>', 'OpenAI API key', process.env.OPENAI_API_KEY)
  .option('--translator-api-key <key>', 'Translator API key', process.env.TRANSLATOR_API_KEY)
  .option('--translator-base-url <url>', 'Translator API base URL', process.env.TRANSLATOR_BASE_URL)
  .option('--translator-model <model>', 'Translator API model', process.env.TRANSLATOR_MODEL || 'gpt-4o')
  // dev
  .option('--use-cache', 'Use cache')
  .action(async (video, targetSrt, nativeSrt, options) => {
    try {
      await createFlashcards({
        input: video,
        targetSrt,
        nativeSrt,
        ...options,
      })
    }
    catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

program.parse()
