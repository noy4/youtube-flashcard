#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { Command } from 'commander'
import packageJson from '../../package.json' with { type: 'json' }
import { AnkiConnector } from '../anki.js'
import { SubtitleConverter } from '../converter.js'
import { FlashcardFormatter } from '../formatter.js'
import { extractVideoId, fetchSubtitles } from '../youtube.js'

const program = new Command()

program
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version)

program
  .command('convert')
  .description('YouTubeの動画URLからフラッシュカードを生成')
  .argument('[url]', 'YouTube動画のURL', process.env.VIDEO_URL)
  .option('-o, --output <path>', '出力ファイルパス', 'output/json.json')
  .option('-f, --format <format>', '出力形式 (json, obsidian または anki)', 'json')
  .option('-s, --source-lang <code>', '元の言語コード', 'en')
  .option('-t, --target-lang <code>', '翻訳後の言語コード', 'ja')
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'Default')
  .option('--model-name <name>', 'Ankiのモデル名', '基本')
  .option('--api-key <key>', 'OpenAI APIキー', process.env.OPENAI_API_KEY)
  .option('-m, --model <model>', 'AIモデル')
  .option('-b, --base-url <url>', 'API baseURL')
  .option('-i, --input <path>', '既存のJSONファイルパス（指定時は字幕取得とフラッシュカード生成をスキップ）')
  .action(async (url, options) => {
    try {
      let flashcards

      if (options.input) {
        console.log(`JSONファイルからフラッシュカードを読み込み中... (${options.input})`)
        const jsonContent = readFileSync(options.input, 'utf8')
        flashcards = JSON.parse(jsonContent)
      }
      else {
        if (!url) {
          console.error('pass video url')
          process.exit(1)
        }

        if (!options.apiKey) {
          console.error('pass openai api key')
          process.exit(1)
        }

        console.log('字幕を取得中...')
        const subtitles = await fetchSubtitles(url, options.sourceLang)
        const videoId = extractVideoId(url)

        console.log('フラッシュカードを生成中...')
        const converter = new SubtitleConverter(subtitles, videoId, {
          apiKey: options.apiKey,
          baseURL: options.baseUrl,
          model: options.model,
        })
        flashcards = await converter.convert(options.sourceLang, options.targetLang)
      }

      if (options.addToAnki) {
        console.log('Ankiにフラッシュカードを追加中...')
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
      if (error instanceof Error) {
        console.error('エラーが発生しました:', error.message)
      }
      else {
        console.error('予期せぬエラーが発生しました')
      }
      process.exit(1)
    }
  })

program.parse()
