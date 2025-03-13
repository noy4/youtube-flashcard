import type { Subtitle } from './youtube.js'

export class SubtitleFormatter {
  /**
   * 字幕テキストを整形
   * 自動生成された字幕テキストを適切な文章形式に整形します
   * @param subtitle 整形する字幕
   * @returns 整形された字幕
   */
  public static format(subtitle: Subtitle): Subtitle {
    const text = subtitle.text.trim()
    let formattedText = text

    // 文末が句読点で終わっていない場合は追加
    if (!/[.。!！?？]$/.test(formattedText)) {
      // 英語の場合はピリオド、日本語の場合は句点を追加
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(formattedText)
      formattedText += hasJapanese ? '。' : '.'
    }

    return {
      ...subtitle,
      text: formattedText,
    }
  }

  /**
   * 字幕配列を一括で整形
   * @param subtitles 整形する字幕の配列
   * @returns 整形された字幕の配列
   */
  public static formatAll(subtitles: Subtitle[]): Subtitle[] {
    return subtitles.map(subtitle => this.format(subtitle))
  }
}
