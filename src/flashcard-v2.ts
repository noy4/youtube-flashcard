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

// ビデオの読み込み処理
async function loadVideo(url?: string, inputPath?: string): Promise<string> {
  const outputPath = 'output/video.mp4'

  if (!fs.existsSync('output'))
    fs.mkdirSync('output', { recursive: true })

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

// 文字起こしプロバイダーインターフェース
interface TranscriptionProvider {
  getTranscription: {
    (videoPath: string): Promise<string>
  }
}

// SRTファイルからの文字起こしプロバイダー
class SrtFileTranscriptionProvider implements TranscriptionProvider {
  async getTranscription(): Promise<string> {
    const srtPath = 'output/transcription.srt'
    if (!fs.existsSync(srtPath))
      throw new Error('SRTファイルが見つかりません')

    return fs.readFileSync(srtPath, 'utf-8')
  }
}

// OpenAIからの文字起こしプロバイダー
class OpenAITranscriptionProvider implements TranscriptionProvider {
  private readonly apiKey: string
  private readonly model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async getTranscription(videoPath: string): Promise<string> {
    const openai = new OpenAI({ apiKey: this.apiKey })
    const file = fs.createReadStream(videoPath)
    const transcription = await openai.audio.transcriptions.create({
      model: this.model,
      file,
      response_format: 'srt',
    })

    return transcription
  }
}

// 出力インターフェース
interface FlashcardOutputter {
  output: {
    (transcription: string): Promise<void>
  }
}

// Anki出力実装
class AnkiFlashcardOutputter implements FlashcardOutputter {
  private readonly deckName: string
  private readonly modelName: string

  constructor(deckName: string, modelName: string) {
    this.deckName = deckName
    this.modelName = modelName
  }

  private async extractAudioSegments(srtContent: string) {
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

  async output(transcription: string): Promise<void> {
    const segments = await this.extractAudioSegments(transcription)
    // TODO: フラッシュカードの生成処理を実装
    const cards: Flashcard[] = []

    const ankiConnector = new AnkiConnector()
    await ankiConnector.addCards(cards, this.deckName, this.modelName)
  }
}

export async function createFlashcardsV2(
  url: string | undefined,
  options: Options,
) {
  // ビデオのロード
  const videoPath = await loadVideo(url, options.input)
  console.log('ビデオのロードが完了しました')

  // 文字起こしプロバイダーの選択と実行
  const transcriptionProvider: TranscriptionProvider = fs.existsSync('output/transcription.srt')
    ? new SrtFileTranscriptionProvider()
    : new OpenAITranscriptionProvider(options.apiKey, options.model)

  console.log('文字起こしを開始します...')
  const transcription = await transcriptionProvider.getTranscription(videoPath)
  fs.writeFileSync('output/transcription.srt', transcription)
  console.log('文字起こしが完了しました')

  // 出力処理
  if (options.addToAnki) {
    const outputter = new AnkiFlashcardOutputter(options.deckName, options.modelName)
    await outputter.output(transcription)
  }
}
