import type { Context } from './flashcard.js'
import { exec } from 'node:child_process'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import { promisify } from 'node:util'
import { YankiConnect } from 'yanki-connect'

const execAsync = promisify(exec)

// Ankiへの出力処理
export async function outputToAnki(context: Context) {
  const { deckName, modelName } = context.options
  const anki = new YankiConnect({ autoLaunch: true })

  await createDeckIfNotExists(anki, deckName)
  await createModelIfNotExists(anki, modelName)
  await extractAudioSegments(context)

  const notes = context.subtitles.map((segment) => {
    return {
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
          data: fs.readFileSync(segment.audioPath!).toString('base64'),
          fields: ['Back'],
        },
      ],
    }
  })

  const results = await anki.note.addNotes({ notes })
  return results.filter(id => id !== null)
}

async function createDeckIfNotExists(
  anki: YankiConnect,
  deckName: string,
) {
  const decks = await anki.deck.deckNames()

  if (!decks.includes(deckName)) {
    await anki.deck.createDeck({ deck: deckName })
    console.log(`デッキ "${deckName}" を作成しました`)
  }
}

async function createModelIfNotExists(
  anki: YankiConnect,
  modelName: string,
) {
  const models = await anki.model.modelNames()

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
}

// 音声セグメントの抽出
async function extractAudioSegments(context: Context) {
  const { paths, subtitles } = context

  if (fs.existsSync(paths.audioDir))
    return

  fs.mkdirSync(paths.audioDir, { recursive: true })

  for (const [index, sub] of subtitles.entries()) {
    const duration = sub.end - sub.start
    await execAsync(
      `ffmpeg -i ${paths.video} -ss ${sub.start / 1000} -t ${duration / 1000} -vn -acodec mp3 "${sub.audioPath}"`,
    )
    console.log(`セグメント ${index + 1}/${subtitles.length} を抽出しました`)
  }

  console.log('すべてのセグメントの抽出が完了しました')
}
