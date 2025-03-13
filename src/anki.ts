import type { Flashcard } from './types.js'
import { YankiConnect } from 'yanki-connect'

export class AnkiConnector {
  private client: YankiConnect

  constructor() {
    this.client = new YankiConnect({ autoLaunch: true })
  }

  /**
   * フラッシュカードをAnkiに直接追加
   * @param cards フラッシュカード配列
   * @param deckName デッキ名（デフォルト: 'Default'）
   * @param modelName モデル名（デフォルト: 'Basic'）
   */
  public async addCards(
    cards: Flashcard[],
    deckName: string = 'Default',
    modelName: string = 'Basic',
  ): Promise<number[]> {
    try {
      // デッキの存在確認
      const decks = await this.client.deck.deckNames()
      console.log('decks:', decks)
      if (!decks.includes(deckName)) {
        await this.client.deck.createDeck({ deck: deckName })
      }

      // モデルの存在確認
      const models = await this.client.model.modelNames()
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

        return await this.client.note.addNote(note)
      }))

      // nullの結果をフィルタリング
      return results.filter((id): id is number => id !== null)
    }
    catch (error) {
      console.error('Ankiへの追加エラー:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }
}
