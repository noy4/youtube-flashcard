import type { Context } from './context.js'
import type { Subtitle } from './types.js'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import { YankiConnect } from 'yanki-connect'
import { execAsync } from './utils.js'

// Ankiへの出力処理
export async function outputToAnki(context: Context) {
  const { options, subtitles, videoTitle } = context
  const { modelName } = options
  const deckName = options.deckName || videoTitle

  const ankiService = new AnkiService()
  await ankiService.ensureDeckExists(deckName)
  await ankiService.ensureModelExists(modelName)
  await extractAudioSegments(context)
  await ankiService.addNotes({ subtitles, deckName, modelName })
}

class AnkiService {
  anki: YankiConnect

  constructor() {
    this.anki = new YankiConnect({ autoLaunch: true })
  }

  async ensureDeckExists(deckName: string) {
    const decks = await this.anki.deck.deckNames()
    if (!decks.includes(deckName)) {
      await this.anki.deck.createDeck({ deck: deckName })
      console.log(`デッキ "${deckName}" を作成しました`)
    }
  }

  async ensureModelExists(modelName: string) {
    const models = await this.anki.model.modelNames()
    if (!models.includes(modelName)) {
      await this.anki.model.createModel({
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

  async addNotes(params: {
    subtitles: Subtitle[]
    deckName: string
    modelName: string
  }) {
    console.log('Adding notes to Anki...')
    const { subtitles, deckName, modelName } = params

    const notes = subtitles.map((sub) => {
      return {
        deckName,
        modelName,
        fields: {
          Front: sub.translation, // 翻訳テキスト
          Back: sub.text, // 元のテキスト
        },
        tags: ['youtube-flashcard'],
        audio: [
          {
            filename: `${crypto.randomUUID()}.mp3`,
            data: fs.readFileSync(sub.audioPath!).toString('base64'),
            fields: ['Back'],
          },
        ],
      }
    })

    const _ids = await this.anki.note.addNotes({ notes })
    const ids = _ids.filter(id => id !== null)
    console.log(`${ids.length} 枚のフラッシュカードを追加しました`)
    return ids
  }
}

// 音声セグメントの抽出
async function extractAudioSegments(context: Context) {
  const { pathManager, subtitles } = context
  const { paths } = pathManager

  if (fs.existsSync(paths.segments(0)))
    return

  pathManager.ensure('segments')

  for (const [index, sub] of subtitles.entries()) {
    const duration = sub.end - sub.start
    const command = `ffmpeg -i ${paths.audio} -ss ${sub.start / 1000} -t ${duration / 1000} -vn -acodec mp3 "${sub.audioPath}"`

    await execAsync(command)
    console.log(`セグメント ${index + 1}/${subtitles.length} を抽出しました`)
  }

  console.log('すべてのセグメントの抽出が完了しました')
}
