import type { Flashcard, OutputFormat } from './types.js'

export class FlashcardFormatter {
  /**
   * フラッシュカードを指定された形式の文字列に変換
   */
  public static toString(cards: Flashcard[], format: OutputFormat = 'obsidian'): string {
    switch (format) {
      case 'obsidian':
        return this.toObsidian(cards)
      case 'anki':
        return this.toAnki(cards)
      case 'json':
        return JSON.stringify(cards, null, 2)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * フラッシュカードをObsidian形式の文字列に変換
   */
  private static toObsidian(cards: Flashcard[]): string {
    const header = '#flashcards\n\n'
    const content = cards.map((card) => {
      return `${card.front}\n?\n${card.back}`
    }).join('\n\n')
    return header + content
  }

  /**
   * フラッシュカードをAnki形式の文字列に変換
   */
  private static toAnki(cards: Flashcard[]): string {
    return cards.map((card) => {
      let front = card.front
      if (card.videoId && typeof card.start !== 'undefined' && typeof card.end !== 'undefined') {
        front += `<br><br><iframe width="560" height="315" src="https://www.youtube.com/embed/${card.videoId}?start=${card.start}&end=${card.end}" frameborder="0"/>`
      }
      return `${front}\t${card.back}`
    }).join('\n')
  }
}
