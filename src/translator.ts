import type { ClientOptions } from 'openai'
import type { Subtitle } from './youtube.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Mustache from 'mustache'
import OpenAI from 'openai'

export type TranslatorOptions = ClientOptions & { model: string }

const PROMPT_DIR = join(import.meta.dirname, 'prompts', 'translator')
function readPrompt(filename: string): string {
  return readFileSync(join(PROMPT_DIR, filename), 'utf-8')
}

export class Translator {
  private client: OpenAI
  private model: string

  constructor(options: TranslatorOptions) {
    const { model, ...clientOptions } = options
    this.client = new OpenAI(clientOptions)
    this.model = model
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
    const systemPrompt = readPrompt('system.md')
    const userPromptTemplate = readPrompt('user.md')
    const userPrompt = Mustache.render(userPromptTemplate, {
      fromLang,
      toLang,
      subtitles: JSON.stringify(subtitles, null, 2),
    })

    console.log('model:', this.model)
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
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
