import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import OpenAI from 'openai'
import { parseSync } from 'subtitle'
import { youtubeDl } from 'youtube-dl-exec'

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
}

export async function createFlashcardsV2(
  _url: string | undefined,
  _options: Options,
) {
  console.log('文字起こしを開始します...')
  try {
    // const openai = new OpenAI()
    // const file = fs.createReadStream('output/video.mp4')
    // const transcription = await openai.audio.transcriptions.create({
    //   model: 'whisper-1',
    //   file,
    //   response_format: 'srt',
    // })

    const transcription = fs.readFileSync('output/transcription.srt', 'utf-8')

    fs.writeFileSync('output/transcription.srt', transcription)
    console.log('文字起こしが完了しました')

    await extractAudioSegments(transcription)
  }
  catch (error) {
    console.error('エラーが発生しました:', error)
    throw error
  }
}
