import type { ClientOptions } from 'openai'
import type { Subtitle } from './youtube.js'
import OpenAI from 'openai'
import { Prompt } from './prompt/index.js'

export type TranslatorOptions = ClientOptions & { model: string }

export class Translator {
  private client: OpenAI
  private model: string
  private prompt: Prompt

  constructor(options: TranslatorOptions) {
    const { model, ...clientOptions } = options
    this.client = new OpenAI(clientOptions)
    this.model = model
    this.prompt = new Prompt('translator')
  }

  /**
   * 複数の字幕を一括で翻訳
   * @param subtitles 翻訳する字幕の配列
   * @param fromLang 元の言語（例: 'en'）
   * @param toLang 翻訳後の言語（例: 'ja'）
   * @returns 翻訳済みの字幕配列
   */
  async translate(
    subtitles: Subtitle[],
    fromLang: string,
    toLang: string,
  ): Promise<Subtitle[]> {
    console.log('model:', this.model)
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: this.prompt.toMessages({
        fromLang,
        toLang,
        subtitles: JSON.stringify(subtitles, null, 2),
      }),
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message.content?.trim() || ''
    console.log('content:', content)
    const parsed = JSON.parse(content)
    const translatedSubtitles = parsed as Subtitle[]

    return translatedSubtitles
  }
}
