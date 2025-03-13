import type { Flashcard } from './types.js'
import { readFileSync } from 'node:fs'
import { SubtitleProcessor } from './subtitle-processor.js'
import { extractVideoId, fetchSubtitles } from './youtube.js'

export class FlashcardGenerator {
  private async generateFromUrl(url: string, options: {
    apiKey: string
    baseUrl?: string
    model: string
    sourceLang: string
    targetLang: string
  }) {
    const subtitles = await fetchSubtitles(url, options.sourceLang)
    const videoId = extractVideoId(url)
    const processor = new SubtitleProcessor(subtitles, {
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
      model: options.model,
    }, videoId)
    return await processor.convert(options.sourceLang, options.targetLang)
  }

  private loadFromJson(path: string): Flashcard[] {
    const jsonContent = readFileSync(path, 'utf8')
    return JSON.parse(jsonContent)
  }

  async generate(options: {
    url?: string
    input?: string
    apiKey?: string
    baseUrl?: string
    model: string
    sourceLang: string
    targetLang: string
  }): Promise<Flashcard[]> {
    if (options.input)
      return this.loadFromJson(options.input)

    if (!options.url)
      throw new Error('動画URLを指定してください')

    if (!options.apiKey)
      throw new Error('OpenAI APIキーを指定してください')

    return await this.generateFromUrl(options.url, {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      model: options.model,
      sourceLang: options.sourceLang,
      targetLang: options.targetLang,
    })
  }
}
