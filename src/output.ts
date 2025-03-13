import type { Flashcard, OutputFormat } from './types.js'
import { writeFileSync } from 'node:fs'
import { AnkiConnector } from './anki.js'
import { FlashcardFormatter } from './formatter.js'

export interface OutputOptions {
  /**
   * 出力形式
   */
  format: OutputFormat
  /**
   * 出力先ファイルパス
   */
  filePath: string
  /**
   * Ankiへの追加オプション
   */
  anki?: {
    enabled: boolean
    deckName: string
    modelName: string
  }
}

export class OutputManager {
  constructor(private flashcards: Flashcard[]) {}

  /**
   * 指定された出力オプションに従ってフラッシュカードを出力
   */
  async output(options: OutputOptions) {
    // Ankiへの出力
    if (options.anki?.enabled)
      await this.outputToAnki(options.anki)

    // ファイルへの出力
    await this.outputToFile(options)
  }

  /**
   * フラッシュカードをAnkiに追加
   */
  private async outputToAnki(options: NonNullable<OutputOptions['anki']>) {
    const ankiConnector = new AnkiConnector()
    const noteIds = await ankiConnector.addCards(
      this.flashcards,
      options.deckName,
      options.modelName,
    )
    console.log(`${noteIds.length}枚のフラッシュカードをAnkiに追加しました`)
    console.log(`デッキ名: ${options.deckName}`)
  }

  /**
   * フラッシュカードをファイルに出力
   */
  private async outputToFile(options: OutputOptions) {
    const output = FlashcardFormatter.toString(this.flashcards, options.format)
    writeFileSync(options.filePath, output, 'utf8')
    console.log(
      `フラッシュカードを ${options.filePath} に保存しました（形式: ${options.format}）`,
    )
  }
}
