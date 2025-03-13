#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { Command } from 'commander'
import packageJson from '../../package.json' with { type: 'json' }
import { AnkiConnector } from '../anki.js'
import { SubtitleConverter } from '../converter.js'
import { FlashcardFormatter } from '../formatter.js'
import { extractVideoId, fetchSubtitles, getAvailableLanguages } from '../youtube.js'

const program = new Command()

program
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version)

program
  .command('convert')
  .description('YouTubeの動画URLからフラッシュカードを生成')
  .argument('[url]', 'YouTube動画のURL（環境変数 VIDEO_URL でも指定可能）')
  .option('-o, --output <path>', '出力ファイルパス', 'output/json.json')
  .option('-f, --format <format>', '出力形式 (json, obsidian または anki)', 'json')
  .option('-s, --source-lang <code>', '元の言語コード', 'en')
  .option('-t, --target-lang <code>', '翻訳後の言語コード', 'ja')
  .option('--add-to-anki', 'フラッシュカードを直接Ankiに追加')
  .option('--deck-name <name>', 'Ankiのデッキ名', 'Default')
  .option('--model-name <name>', 'Ankiのモデル名', '基本')
  .option('--api-key <key>', 'OpenAI APIキー（環境変数 OPENAI_API_KEY でも指定可能）')
  .option('-m, --model <model>', 'AIモデル（環境変数 AI_MODEL でも指定可能）')
  .option('-b, --base-url <url>', 'API baseURL（環境変数 OPENAI_BASE_URL でも指定可能）')
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
        const videoUrl = url || process.env.VIDEO_URL
        if (!videoUrl) {
          console.error('エラー: YouTube URLが必要です。引数または環境変数VIDEO_URLで指定してください。')
          process.exit(1)
        }

        const apiKey = options.apiKey || process.env.OPENAI_API_KEY
        if (!apiKey) {
          console.error('エラー: OpenAI APIキーが必要です。--api-keyオプションまたは環境変数OPENAI_API_KEYで指定してください。')
          process.exit(1)
        }

        console.log('字幕を取得中...')
        const subtitles = await fetchSubtitles(videoUrl, options.sourceLang)
        const videoId = extractVideoId(videoUrl)

        console.log('フラッシュカードを生成中...')
        const converter = new SubtitleConverter(subtitles, videoId, {
          apiKey,
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

program
  .command('languages')
  .description('YouTubeの動画で利用可能な字幕の言語コードを表示')
  .argument('<url>', 'YouTube動画のURL')
  .action(async (url) => {
    try {
      const languages = await getAvailableLanguages(url)
      if (languages.length > 0) {
        console.log('利用可能な言語コード:')
        languages.forEach(lang => console.log(`- ${lang}`))
        console.log('\n注意: 現在は英語(en)の字幕のみに対応しています。')
      }
      else {
        console.log('この動画で利用可能な字幕が見つかりませんでした。')
      }
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
