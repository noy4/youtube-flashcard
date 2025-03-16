import type { Context, Subtitle } from './flashcard.js'
import { exec } from 'node:child_process'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import { promisify } from 'node:util'
import { YankiConnect } from 'yanki-connect'

const execAsync = promisify(exec)

// Ankiへの出力処理
export async function outputToAnki(context: Context) {
  const { options, subtitles } = context
  const { deckName, modelName } = options

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
  const { paths, subtitles } = context

  if (fs.existsSync(paths.audioDir))
    return

  fs.mkdirSync(paths.audioDir, { recursive: true })

  for (const [index, sub] of subtitles.entries()) {
    const duration = sub.end - sub.start
    const command = `ffmpeg -i ${paths.video} -ss ${sub.start / 1000} -t ${duration / 1000} -vn -acodec mp3 "${sub.audioPath}"`

    await execAsync(command)
    console.log(`セグメント ${index + 1}/${subtitles.length} を抽出しました`)
  }

  console.log('すべてのセグメントの抽出が完了しました')
}
