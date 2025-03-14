import type { OutputFormat } from './types.js'
import { FlashcardGenerator } from './generator.js'
import { OutputManager } from './output.js'

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

export async function createFlashcards(
  url: string | undefined,
  options: Options,
) {
  const generator = new FlashcardGenerator()
  const flashcards = await generator.generate({
    url,
    input: options.input,
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    model: options.model,
    fromLang: options.fromLang,
    toLang: options.toLang,
  })

  const outputManager = new OutputManager(flashcards)
  await outputManager.output({
    format: options.format as OutputFormat,
    filePath: options.output,
    anki: options.addToAnki
      ? {
          enabled: true,
          deckName: options.deckName,
          modelName: options.modelName,
        }
      : undefined,
  })
}
