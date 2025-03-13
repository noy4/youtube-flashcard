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

  private async process(promptName: string, data: Record<string, any>) {
    const prompt = Prompt.load(promptName)
    const messages = prompt.toMessages(data)

    console.time(promptName)
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
      // json_mode, except for openai (they doesn't return array in json_mode)
      // ref: [`json_mode` returns no JSON arrays - API - OpenAI Developer Community](https://community.openai.com/t/json-mode-returns-no-json-arrays/480792)
      ...(!this.model.includes('openai') && {
        response_format: { type: 'json_object' },
      }),
    })

    const content = response.choices[0]?.message.content?.trim() || '[]'
    console.log('content:', content)
    console.log('usage:', response.usage)
    console.timeEnd(promptName)
    return JSON.parse(content) as Subtitle[]
  }

  async convert(
    subtitles: Subtitle[],
    fromLang: string = 'en',
    toLang: string = 'ja',
  ): Promise<Flashcard[]> {
    console.log('model:', this.model)
    // パイプライン: 字幕 -> 整形 -> 翻訳 -> フラッシュカード

    console.log('Processing subtitles...')
    const formatted = await this.process('format', { subtitles })

    console.log('Translating subtitles...')
    const translated = await this.process('translate', {
      subtitles: formatted,
      fromLang,
      toLang,
    })

    return translated.map(({ translation, text, start, end }) => ({
      front: translation!,
      back: text,
      videoId: this.videoId,
      start,
      end,
    }))
  }
}
