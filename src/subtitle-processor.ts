import type { ClientOptions } from 'openai'
import type { Flashcard } from './types.js'
import type { Subtitle } from './youtube.js'
import OpenAI from 'openai'
import { Prompt } from './prompt/index.js'

export type ProcessorOptions = ClientOptions & { model: string }

export class SubtitleProcessor {
  private openai: OpenAI
  private model: string

  constructor(options: ProcessorOptions, private videoId: string) {
    const { model, ...clientOptions } = options
    this.openai = new OpenAI(clientOptions)
    this.model = model
  }

  private async processWithAI(promptName: string, data: Record<string, any>) {
    const prompt = Prompt.load(promptName)
    const messages = prompt.toMessages(data)
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message.content?.trim() || '[]'
    console.log('usage:', response.usage)
    return JSON.parse(content) as Subtitle[]
  }

  private toFlashcard(subtitle: Subtitle): Flashcard {
    return {
      front: subtitle.translation!,
      back: subtitle.text,
      videoId: this.videoId,
      start: subtitle.start,
      end: subtitle.end,
    }
  }

  async convert(
    subtitles: Subtitle[],
    fromLang: string = 'en',
    toLang: string = 'ja',
  ): Promise<Flashcard[]> {
    // パイプライン: 字幕 -> 整形 -> 翻訳 -> フラッシュカード
    console.log('model:', this.model)
    console.log('Processing subtitles...')
    const formatted = await this.processWithAI('formatter', { subtitles })
    console.log('Translating subtitles...')
    const translated = await this.processWithAI('translator', {
      subtitles: formatted,
      fromLang,
      toLang,
    })

    return translated.map(subtitle => this.toFlashcard(subtitle))
  }
}
