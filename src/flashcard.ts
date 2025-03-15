import type { Flashcard } from './types.js'
import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import OpenAI from 'openai'
import { parseSync } from 'subtitle'
import { AnkiConnector } from './anki.js'

const execAsync = promisify(exec)

export interface Options {
  input?: string | undefined
  output: string
  format: string
  subs1?: string | undefined
  subs2?: string | undefined
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
async function loadVideo(inputPath: string): Promise<string> {
  const outputPath = 'output/video.mp4'

  // ファイルシステムからの読み込み
  if (!fs.existsSync(inputPath))
    throw new Error(`入力ファイル ${inputPath} が見つかりません`)

  fs.copyFileSync(inputPath, outputPath)
  return outputPath
}

// 文字起こしの読み込み
async function loadTranscription(videoPath: string, options: Options): Promise<{ front: string, back: string }> {
  let subs1: string
  let subs2: string

  // 字幕1の読み込み
  if (options.subs1 && fs.existsSync(options.subs1)) {
    subs1 = fs.readFileSync(options.subs1, 'utf-8')
  }
  else {
    // OpenAIで文字起こしを生成
    const openai = new OpenAI({ apiKey: options.apiKey })
    const file = fs.createReadStream(videoPath)
    subs1 = await openai.audio.transcriptions.create({
      model: options.model,
      file,
      response_format: 'srt',
    })
    fs.writeFileSync('output/subs1.srt', subs1)
  }

  // 字幕2の読み込み
  if (options.subs2 && fs.existsSync(options.subs2)) {
    subs2 = fs.readFileSync(options.subs2, 'utf-8')
  }
  else {
    // 字幕1と同じSRTを使用
    subs2 = subs1
  }

  return { front: subs1, back: subs2 }
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
async function outputToAnki(
  transcriptions: { front: string, back: string },
  deckName: string,
  modelName: string,
): Promise<void> {
  // フロント用の音声セグメント抽出
  const _frontSegments = await extractAudioSegments(transcriptions.front)
  // バック用の音声セグメント抽出
  const _backSegments = await extractAudioSegments(transcriptions.back)

  // TODO: フロントとバックのセグメントを組み合わせてフラッシュカードを生成
  const cards: Flashcard[] = []

  const ankiConnector = new AnkiConnector()
  await ankiConnector.addCards(cards, deckName, modelName)
}

export async function createFlashcards(options: Options) {
  // 出力ディレクトリを準備
  setupOutputDirectory()

  // ビデオのロード
  const videoPath = await loadVideo(options.input!)
  console.log('ビデオのロードが完了しました')

  // 文字起こしの読み込み
  console.log('文字起こしを開始します...')
  const transcriptions = await loadTranscription(videoPath, options)
  console.log('文字起こしが完了しました')

  // 出力処理
  if (options.addToAnki)
    await outputToAnki(transcriptions, options.deckName, options.modelName)
}
