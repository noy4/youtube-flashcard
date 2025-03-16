import type { Context } from './flashcard.js'
import { exec } from 'node:child_process'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'
import { parseSync } from 'subtitle'
import { YankiConnect } from 'yanki-connect'

const execAsync = promisify(exec)

interface Segment {
  start: number
  end: number
  text: string
  translation: string
}

function parseSubs(content: string) {
  return parseSync(content)
    .filter(node => node.type === 'cue')
    .map(v => v.data)
}

// 音声セグメントの抽出
async function extractAudioSegments(context: Context) {
  const outputDir = 'output/segments'
  const subs1 = parseSubs(context.subs1Content)
  const subs2 = parseSubs(context.subs2Content)

  const segments: Segment[] = []
  for (const [index, sub] of subs1.entries()) {
    segments.push({
      ...sub,
      translation: subs2[index].text,
    })
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })

    for (const [index, segment] of segments.entries()) {
      const duration = segment.end - segment.start
      const outputFile = path.join(outputDir, `segment_${index}.mp3`)

      await execAsync(
        `ffmpeg -i ${context.paths.video} -ss ${segment.start / 1000} -t ${duration / 1000} -vn -acodec mp3 "${outputFile}"`,
      )
      console.log(`セグメント ${index + 1}/${segments.length} を抽出しました`)
    }
  }

  console.log('すべてのセグメントの抽出が完了しました')
  return segments
}

// Ankiへの出力処理
export async function outputToAnki(context: Context) {
  const { deckName, modelName } = context.options
  const anki = new YankiConnect({ autoLaunch: true })

  const decks = await anki.deck.deckNames()
  const models = await anki.model.modelNames()

  // モデルが存在しない場合は作成
  if (!models.includes(modelName)) {
    await anki.model.createModel({
      modelName,
      inOrderFields: ['Front', 'Back'],
      cardTemplates: [{
        Front: '{{Front}}',
        Back: '{{FrontSide}}<hr id="answer">{{Back}}',
      }],
    })
    console.log(`モデル "${modelName}" を作成しました`)
  }

  // デッキが存在しない場合は作成
  if (!decks.includes(deckName)) {
    await anki.deck.createDeck({ deck: deckName })
    console.log(`デッキ "${deckName}" を作成しました`)
  }

  const segments = await extractAudioSegments(context)

  const notes = segments.map((segment, index) => {
    const audioPath = path.join('output', 'segments', `segment_${index}.mp3`)
    const note = {
      deckName,
      modelName,
      fields: {
        Front: segment.translation, // 翻訳テキスト
        Back: segment.text, // 元のテキスト
      },
      tags: ['youtube-flashcard'],
      audio: [
        {
          filename: `${crypto.randomUUID()}.mp3`,
          data: fs.readFileSync(audioPath).toString('base64'),
          fields: ['Back'],
        },
      ],
    }
    return note
  })

  const results = await anki.note.addNotes({ notes })
  return results.filter(id => id !== null)
}
