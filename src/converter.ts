import type { TranslatorOptions } from './translator.js'
import type { Subtitle } from './youtube.js'
import { YankiConnect } from 'yanki-connect'
import { Translator } from './translator.js'

export type OutputFormat = 'obsidian' | 'anki' | 'json'

interface Flashcard {
  front: string
  back: string
  videoId?: string
  start: number
  end: number
}

export class SubtitleConverter {
  private translator: Translator
  private subtitles: Subtitle[]
  public ankiClient: YankiConnect

  constructor(
    subtitles: Subtitle[],
    private videoId: string,
    translatorOptions?: TranslatorOptions,
  ) {
    this.ankiClient = new YankiConnect({ autoLaunch: true })
    this.translator = new Translator(translatorOptions)
    this.subtitles = subtitles
  }

  /**
   * 字幕をObsidian Spaced Repetition形式のフラッシュカードに変換
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
      throw error // 一括翻訳でエラーが発生した場合は、呼び出し元で処理してもらう
    }
  }

  /**
   * フラッシュカードを指定された形式の文字列に変換
   */
  public toString(cards: Flashcard[], format: OutputFormat = 'obsidian'): string {
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
  private toObsidian(cards: Flashcard[]): string {
    const header = '#flashcards\n\n'
    const content = cards.map((card) => {
      return `${card.front}\n?\n${card.back}`
    }).join('\n\n')
    return header + content
  }

  /**
   * フラッシュカードをAnki形式の文字列に変換
   */
  private toAnki(cards: Flashcard[]): string {
    return cards.map((card) => {
      let content = card.front
      if (card.videoId && card.start && card.end) {
        const start = card.start
        const end = card.end
        content += `<br><br><iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/${card.videoId}?start=${start}&end=${end}&autoplay=1"
  frameborder="0"
  autoplay="1"
/>`
      }
      return `${content}\t${card.back}`
    }).join('\n')
  }

  /**
   * フラッシュカードをAnkiに直接追加
   * @param cards フラッシュカード配列
   * @param deckName デッキ名（デフォルト: 'Default'）
   * @param modelName モデル名（デフォルト: 'Basic'）
   */
  public async addToAnki(
    cards: Flashcard[],
    deckName: string = 'Default',
    modelName: string = 'Basic',
  ): Promise<number[]> {
    try {
      // デッキの存在確認
      const decks = await this.ankiClient.deck.deckNames()
      console.log('decks:', decks)
      if (!decks.includes(deckName)) {
        await this.ankiClient.deck.createDeck({ deck: deckName })
      }

      // モデルの存在確認
      const models = await this.ankiClient.model.modelNames()
      if (!models.includes(modelName)) {
        throw new Error(`Model '${modelName}' not found. Please create it in Anki first.`)
      }
      console.log('models:', models)

      // カードをAnkiノート形式に変換して追加
      const results = await Promise.all(cards.map(async (card) => {
        const front = `${card.front}<br><br><iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/${card.videoId}?start=${card.start}&end=${card.end}&autoplay=1"
          frameborder="0"
          autoplay="1"
        />`

        const note = {
          note: {
            deckName,
            modelName,
            fields: {
              Front: front,
              Back: card.back,
            },
            options: {
              allowDuplicate: false,
            },
            tags: ['youtube-flashcard'],
          },
        }

        return await this.ankiClient.note.addNote(note)
      }))

      // nullの結果をフィルタリング
      const noteIds = results.filter((id): id is number => id !== null)
      return noteIds
    }
    catch (error) {
      console.error('Ankiへの追加エラー:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }
}
