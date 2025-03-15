import type { Context } from './flashcard.js'
import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import { parseSync } from 'subtitle'
import { YankiConnect } from 'yanki-connect'

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
    .map(v => v.data)

  for (const [index, segment] of segments.entries()) {
    const duration = segment.end - segment.start
    const outputFile = path.join(outputDir, `segment_${index}.mp3`)

    await execAsync(
      `ffmpeg -i ${context.paths.video} -ss ${segment.start} -t ${duration} -vn -acodec mp3 "${outputFile}"`,
    )
    console.log(`セグメント ${index + 1}/${segments.length} を抽出しました`)
  }
  console.log('すべてのセグメントの抽出が完了しました')
  return segments
}

// Ankiへの出力処理
export async function outputToAnki(context: Context) {
  const { deckName, modelName } = context.options
  const anki = new YankiConnect({ autoLaunch: true })
  const decks = await anki.deck.deckNames()
  console.log('decks:', decks)

  const segments = await extractAudioSegments(context)

  const notes = segments.map((segment) => {
    const note = {
      deckName,
      modelName,
      fields: {
        Front: segment.text,
        Back: '',
      },
      options: {
        allowDuplicate: false,
      },
      tags: ['youtube-flashcard'],
    }
    return note
  })

  const results = await anki.note.addNotes({ notes })
  return results.filter(id => id !== null)
}
