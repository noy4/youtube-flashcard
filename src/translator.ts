import type { ClientOptions } from 'openai'
import type { Subtitle } from './youtube.js'
import { writeFileSync } from 'node:fs'
import OpenAI from 'openai'

export type TranslatorOptions = ClientOptions & {
  model?: string
}

export class Translator {
  private client: OpenAI
  private model: string

  constructor(options?: TranslatorOptions) {
    if (!options?.apiKey) {
      throw new Error('OpenRouter APIキーが必要です')
    }

    const { model, ...clientOptions } = options

    this.client = new OpenAI({
      ...clientOptions,
      baseURL: clientOptions.baseURL || process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    })

    this.model = model || process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free'
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
    const systemPrompt = `You are a professional subtitle translator. You will receive a list of subtitles in JSON format.

Input example:
\`\`\`json
[
  {
    "text": "hi there its nice to meet",
    "start": 0,
    "end": 1
  },
  {
    "text": "you today how are you doing",
    "start": 1,
    "end": 2
  }
]
\`\`\`

Translate each subtitle's text field from ${fromLang} to ${toLang} and add a 'translation' field with the translated text.
As the input text might be auto-generated, please format it into proper sentences before translation.

Output example:
\`\`\`json
[
  {
    "text": "Hi there! It's nice to meet",
    "start": 0,
    "end": 1,
    "translation": "こんにちは！お会いできて"
  },
  {
    "text": "you today. How are you doing?",
    "start": 1,
    "end": 2,
    "translation": "うれしいです。お元気ですか？"
  }
]
\`\`\`

The output will be JSON parsed, so make sure to output valid JSON.`

    try {
      console.log('model:', this.model)
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify(subtitles, null, 2),
          },
        ],
        temperature: 0.3,
      })

      if (!response.choices || response.choices.length === 0) {
        throw new Error('翻訳結果が空でした')
      }

      const content = response.choices[0]?.message?.content?.trim()
      if (!content) {
        throw new Error('翻訳結果が空でした')
      }

      try {
        console.log('content:', content)
        const parsed = JSON.parse(content)
        if (!Array.isArray(parsed)) {
          throw new TypeError('翻訳結果が配列ではありません')
        }
        const translatedSubtitles = parsed as Subtitle[]
        writeFileSync('output/translations.json', JSON.stringify(translatedSubtitles, null, 2), 'utf8')

        if (translatedSubtitles.length !== subtitles.length) {
          throw new TypeError('翻訳結果の数が入力字幕の数と一致しません')
        }

        return translatedSubtitles
      }
      catch (error) {
        throw new Error('翻訳中にエラーが発生しました')
      }
    }
    catch (error) {
      if (error instanceof Error) {
        if (error.message === '翻訳結果が空でした') {
          throw error
        }
      }
      throw new Error('翻訳中にエラーが発生しました')
    }
  }
}
