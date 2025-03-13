import type { ClientOptions } from 'openai'
import type { Subtitle } from './youtube.js'
import OpenAI from 'openai'
import { Prompt } from './prompt/index.js'

export type FormatterOptions = ClientOptions & { model: string }

export class SubtitleFormatter {
  private openai: OpenAI
  private model: string
  private prompt: Prompt

  constructor(options: FormatterOptions) {
    const { model, ...clientOptions } = options
    this.openai = new OpenAI(clientOptions)
    this.model = model
    this.prompt = Prompt.load('formatter')
  }

  /**
   * 複数の字幕テキストを一括で整形
   * @param subtitles 整形する字幕の配列
   * @returns 整形済みの字幕配列
   */
  async format(subtitles: Subtitle[]): Promise<Subtitle[]> {
    console.log('model:', this.model)

    const messages = this.prompt.toMessages({
      subtitles: JSON.stringify(subtitles, null, 2),
    })

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message.content?.trim() || ''
    console.log('content:', content)
    return JSON.parse(content) as Subtitle[]
  }
}
