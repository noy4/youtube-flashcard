import type { ClientOptions } from 'openai'
import type { Subtitle } from './youtube.js'
import OpenAI from 'openai'

export type TranslatorOptions = ClientOptions & { model: string }

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
    const systemPrompt = `You are a professional subtitle translator.`

    const userPrompt = `You will receive a JSON array of subtitles.

<input_example>
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
</input_example>

Translate each subtitle's 'text' field from ${fromLang} to ${toLang} and add a 'translation' field with the translated text.

<output_example>
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
</output_example>

Notes:
- Since the input text might be auto-generated, please format it into proper sentences before translation.
- The output will be JSON parsed, so ensure it is completely valid JSON.
Do not return truncated or incomplete JSON.

Now, please translate the following subtitles:

<input>
${JSON.stringify(subtitles, null, 2)}
</input>
`

    console.log('model:', this.model)
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 1_000_000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message.content?.trim() || ''
    console.log('content:', content)
    const parsed = JSON.parse(content)
    const translatedSubtitles = parsed as Subtitle[]

    return translatedSubtitles
  }
}
