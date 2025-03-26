import type { Context } from './context.js'
import type { Subtitle } from './types.js'
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import { YankiConnect } from 'yanki-connect'
import { execAsync } from './utils.js'

/**
 * Output to Anki
 */
export async function outputToAnki(context: Context) {
  const { options, subtitles, state } = context
  const { modelName } = options
  const deckName = options.deckName || state.videoTitle

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
      console.log(`Created deck "${deckName}"`)
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
      console.log(`Created model "${modelName}"`)
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
          Front: sub.translation, // Translated text
          Back: sub.text, // Original text
        },
        audio: [
          {
            filename: `${crypto.randomUUID()}.mp3`,
            data: fs.readFileSync(sub.audioPath!).toString('base64'),
            fields: ['Back'],
          },
        ],
      }
    })

    const errors: string[] = []

    for (const [index, note] of notes.entries()) {
      const number = index + 1
      try {
        await this.anki.note.addNote({ note })
        console.log('Added:', number)
      }
      catch (error) {
        console.error(`Failed: ${number} - ${error.message}`)
        errors.push(`${number}: ${error.message}`)
      }
    }

    if (errors.length) {
      console.error(`Failed to add ${errors.length} notes. Errors:`, errors)
    }
  }
}

/**
 * Extract audio segments
 */
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
    console.log(`Extracted segment ${index + 1}/${subtitles.length}`)
  }

  console.log('All segments have been extracted')
}
