import type { Flashcard } from './types.js'
import { readFileSync } from 'node:fs'
import { SubtitleProcessor } from './subtitle-processor.js'
import { extractVideoId, fetchSubtitles } from './youtube.js'

export class FlashcardGenerator {
  private loadFromJson(path: string): Flashcard[] {
    return JSON.parse(readFileSync(path, 'utf8'))
  }

  async generate(options: {
    url?: string
    input?: string
    apiKey?: string
    baseUrl?: string
    model: string
    fromLang: string
    toLang: string
  }): Promise<Flashcard[]> {
    if (options.input)
      return this.loadFromJson(options.input)

    if (!options.url)
      throw new Error('動画URLを指定してください')

    if (!options.apiKey)
      throw new Error('OpenAI APIキーを指定してください')

    const subtitles = await fetchSubtitles(options.url, options.fromLang)
    const videoId = extractVideoId(options.url)
    const processor = new SubtitleProcessor({
      apiKey: options.apiKey,
      baseURL: options.baseUrl,
      model: options.model,
    }, videoId)
    return await processor.convert(subtitles, options.fromLang, options.toLang)
  }
}
