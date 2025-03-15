import type { Flashcard } from './types.js'
import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import OpenAI from 'openai'
import { parseSync } from 'subtitle'
import { youtubeDl } from 'youtube-dl-exec'
import { AnkiConnector } from './anki.js'

const execAsync = promisify(exec)

export interface Options {
  input?: string | undefined
  output: string
  format: string
  fromLang: string
  toLang: string
  addToAnki?: true | undefined
  deckName: string
  modelName: string
  apiKey: string
  baseUrl: string
  model: string
}

// 出力フォルダを準備
function setupOutputDirectory() {
  if (!fs.existsSync('output'))
    fs.mkdirSync('output', { recursive: true })
}

// ビデオの読み込み処理
async function loadVideo(url?: string, inputPath?: string): Promise<string> {
  const outputPath = 'output/video.mp4'

  if (inputPath) {
    // ファイルシステムからの読み込み
    if (!fs.existsSync(inputPath))
      throw new Error(`入力ファイル ${inputPath} が見つかりません`)

    fs.copyFileSync(inputPath, outputPath)
  }
  else if (url) {
    // YouTubeからの読み込み
    await youtubeDl(url, {
      output: outputPath,
      format: 'mp4',
    })
  }
  else {
    throw new Error('URLまたは入力ファイルが指定されていません')
  }

  return outputPath
}

// 文字起こしの読み込み
async function loadTranscription(videoPath: string, options: Options): Promise<string> {
  const srtPath = 'output/transcription.srt'

  // 既存のSRTファイルがある場合はそれを使用
  if (fs.existsSync(srtPath))
    return fs.readFileSync(srtPath, 'utf-8')

  // OpenAIで文字起こしを生成
  const openai = new OpenAI({ apiKey: options.apiKey })
  const file = fs.createReadStream(videoPath)
  const transcription = await openai.audio.transcriptions.create({
    model: options.model,
    file,
    response_format: 'srt',
  })

  // SRTファイルとして保存
  fs.writeFileSync(srtPath, transcription)

  return transcription
}

// 音声セグメントの抽出
async function extractAudioSegments(srtContent: string) {
  console.log('音声セグメントの抽出を開始します...')
  const outputDir = 'output/segments'

  if (!fs.existsSync(outputDir))
    fs.mkdirSync(outputDir, { recursive: true })

  const segments = parseSync(srtContent)
    .filter(node => node.type === 'cue')

  for (const [index, segment] of segments.entries()) {
    const duration = segment.data.end - segment.data.start
    const outputFile = path.join(outputDir, `segment_${index}.mp3`)

    try {
      await execAsync(
        `ffmpeg -i output/video.mp4 -ss ${segment.data.start} -t ${duration} -vn -acodec mp3 "${outputFile}"`,
      )
      console.log(`セグメント ${index + 1}/${segments.length} を抽出しました`)
    }
    catch (error) {
      console.error(`セグメント ${index + 1} の抽出に失敗しました:`, error)
      throw error
    }
  }
  console.log('すべてのセグメントの抽出が完了しました')
  return segments
}

// Ankiへの出力処理
async function outputToAnki(transcription: string, deckName: string, modelName: string): Promise<void> {
  // 音声セグメントの抽出とフラッシュカードの生成
  const _segments = await extractAudioSegments(transcription)
  // TODO: フラッシュカードの生成処理を実装
  const cards: Flashcard[] = []

  const ankiConnector = new AnkiConnector()
  await ankiConnector.addCards(cards, deckName, modelName)
}

export async function createFlashcardsV2(
  url: string | undefined,
  options: Options,
) {
  // 出力ディレクトリを準備
  setupOutputDirectory()

  // ビデオのロード
  const videoPath = await loadVideo(url, options.input)
  console.log('ビデオのロードが完了しました')

  // 文字起こしの読み込み
  console.log('文字起こしを開始します...')
  const transcription = await loadTranscription(videoPath, options)
  console.log('文字起こしが完了しました')

  // 出力処理
  if (options.addToAnki)
    await outputToAnki(transcription, options.deckName, options.modelName)
}
