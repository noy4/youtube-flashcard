import type { ClientOptions } from 'openai'
import type { Flashcard } from './types.js'
import type { Subtitle } from './youtube.js'
import OpenAI from 'openai'
import { Prompt } from './prompt/index.js'

export type ProcessorOptions = ClientOptions & { model: string }

export class SubtitleProcessor {
  private openai: OpenAI
  private model: string

  constructor(
    options: ProcessorOptions,
    private videoId: string,
  ) {
    const { model, ...clientOptions } = options
    this.openai = new OpenAI(clientOptions)
    this.model = model
  }

  /**
   * OpenAI APIを使用して字幕を処理
   */
  async process(
    promptName: string,
    params: Record<string, any> = {},
  ) {
    console.log('model:', this.model)

    const prompt = Prompt.load(promptName)
    const messages = prompt.toMessages({
      ...params,
      subtitles: JSON.stringify(params.subtitles, null, 2),
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

  /**
   * 字幕テキストを整形
   */
  async format(subtitles: Subtitle[]) {
    return this.process('formatter', { subtitles })
  }

  /**
   * 字幕を翻訳
   */
  async translate(subtitles: Subtitle[], fromLang: string, toLang: string) {
    return this.process('translator', { subtitles, fromLang, toLang })
  }

  /**
   * 字幕をフラッシュカードに変換
   */
  async convert(
    subtitles: Subtitle[],
    sourceLang: string = 'en',
    targetLang: string = 'ja',
  ): Promise<Flashcard[]> {
    try {
      // 字幕テキストを整形
      const formattedSubtitles = await this.format(subtitles)

      // 整形済み字幕を翻訳
      const translatedSubtitles = await this.translate(formattedSubtitles, sourceLang, targetLang)

      // 翻訳済み字幕からフラッシュカードを作成
      return translatedSubtitles.map(subtitle => ({
        front: subtitle.translation!,
        back: subtitle.text,
        videoId: this.videoId,
        start: subtitle.start,
        end: subtitle.end,
      }))
    }
    catch (error) {
      console.error(`処理エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }
}
