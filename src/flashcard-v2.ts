import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import OpenAI from 'openai'
import { youtubeDl } from 'youtube-dl-exec'

const execAsync = promisify(exec)

interface Segment {
  start: number
  end: number
  text: string
}

// SRTのタイムスタンプを秒数に変換
function timeToSeconds(timestamp: string): number {
  const [hours, minutes, seconds] = timestamp.split(':').map(Number)
  const [secs, ms] = seconds.toString().split(',').map(Number)
  return hours * 3600 + minutes * 60 + secs + ms / 1000
}

// SRTファイルをパースしてセグメントの配列に変換
function parseSrt(srtContent: string): Segment[] {
  const segments: Segment[] = []
  const blocks = srtContent.trim().split('\n\n')

  for (const block of blocks) {
    const [_, timeLine, ...textLines] = block.split('\n')
    if (!timeLine)
      continue

    const [start, end] = timeLine.split(' --> ')
    if (!start || !end)
      continue

    segments.push({
      start: timeToSeconds(start),
      end: timeToSeconds(end),
      text: textLines.join('\n'),
    })
  }

  return segments
}

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

async function extractAudioSegments(segments: Segment[]) {
  const outputDir = 'output/segments'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  console.log('音声セグメントの抽出を開始します...')
  for (const [index, segment] of segments.entries()) {
    const duration = segment.end - segment.start
    const outputFile = path.join(outputDir, `segment_${index}.mp3`)

    try {
      await execAsync(
        `ffmpeg -i output/video.mp4 -ss ${segment.start} -t ${duration} -vn -acodec mp3 "${outputFile}"`,
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
    const openai = new OpenAI()
    const file = fs.createReadStream('output/video.mp4')
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'srt',
    })

    fs.writeFileSync('output/transcription.srt', transcription)
    console.log('文字起こしが完了しました')

    const segments = parseSrt(transcription)
    await extractAudioSegments(segments)
  }
  catch (error) {
    console.error('エラーが発生しました:', error)
    throw error
  }
}
