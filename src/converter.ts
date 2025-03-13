import type { TranslatorOptions } from './translator.js'
import type { Flashcard } from './types.js'
import type { Subtitle } from './youtube.js'
import { Translator } from './translator.js'

export class SubtitleConverter {
  private translator: Translator
  private subtitles: Subtitle[]

  constructor(
    subtitles: Subtitle[],
    private videoId: string,
    translatorOptions?: TranslatorOptions,
  ) {
    this.translator = new Translator(translatorOptions)
    this.subtitles = subtitles
  }

  /**
   * 字幕をフラッシュカードに変換
   * @param sourceLang 元の言語コード（例: 'en'）
   * @param targetLang 翻訳後の言語コード（例: 'ja'）
   */
  public async convert(
    sourceLang: string = 'en',
    targetLang: string = 'ja',
  ): Promise<Flashcard[]> {
    try {
      // 字幕を翻訳
      const translatedSubtitles = await this.translator.translate(this.subtitles, sourceLang, targetLang)

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
      console.error(`翻訳エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }
}
