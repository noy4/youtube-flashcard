import type { Context } from './flashcard.js'
import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import { parseSync } from 'subtitle'
import { AnkiConnector } from './anki.js'

const execAsync = promisify(exec)

// 音声セグメントの抽出
async function extractAudioSegments(context: Context) {
  console.log('音声セグメントの抽出を開始します...')
  const outputDir = 'output/segments'

  if (!fs.existsSync(outputDir))
    fs.mkdirSync(outputDir, { recursive: true })

  const srtContent = fs.readFileSync(context.paths.subs1, 'utf-8')
  const segments = parseSync(srtContent)
    .filter(node => node.type === 'cue')

  for (const [index, segment] of segments.entries()) {
    const duration = segment.data.end - segment.data.start
    const outputFile = path.join(outputDir, `segment_${index}.mp3`)

    await execAsync(
      `ffmpeg -i ${context.paths.video} -ss ${segment.data.start} -t ${duration} -vn -acodec mp3 "${outputFile}"`,
    )
    console.log(`セグメント ${index + 1}/${segments.length} を抽出しました`)
  }
  console.log('すべてのセグメントの抽出が完了しました')
  return segments
}

// Ankiへの出力処理
export async function outputToAnki(context: Context) {
  const _segments = await extractAudioSegments(context)
  const ankiConnector = new AnkiConnector()
  // await ankiConnector.addCards(cards, deckName, modelName)
}
