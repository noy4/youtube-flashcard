import { Translator } from './translator.js';

export type OutputFormat = 'obsidian' | 'anki' | 'json';

interface Flashcard {
  front: string;
  back: string;
  videoId?: string;
  startTime?: number;
  endTime?: number;
}

export class SubtitleConverter {
  private subtitles: string[];
  private translator: Translator | null;

  constructor(
    subtitles: string[],
    private videoId?: string,
    private startTimes?: number[],
    private endTimes?: number[],
    apiKey?: string
  ) {
    this.subtitles = subtitles;
    this.translator = apiKey ? new Translator(apiKey) : null;
  }

  /**
   * 字幕をObsidian Spaced Repetition形式のフラッシュカードに変換
   * @param sourceLang 元の言語コード（例: 'en'）
   * @param targetLang 翻訳後の言語コード（例: 'ja'）
   */
  public async convert(sourceLang: string = 'en', targetLang: string = 'ja'): Promise<Flashcard[]> {
    return this.createTranslatedCards(this.subtitles, sourceLang, targetLang);
  }

  /**
   * フラッシュカードを指定された形式の文字列に変換
   */
  public toString(cards: Flashcard[], format: OutputFormat = 'obsidian'): string {
    switch (format) {
      case 'obsidian':
        return this.toObsidian(cards);
      case 'anki':
        return this.toAnki(cards);
      case 'json':
        return JSON.stringify(cards, null, 2);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * フラッシュカードをObsidian形式の文字列に変換
   */
  private toObsidian(cards: Flashcard[]): string {
    const header = '#flashcards\n\n';
    const content = cards.map(card => {
      return `${card.front}\n?\n${card.back}`;
    }).join('\n\n');
    return header + content;
  }

  /**
   * フラッシュカードをAnki形式の文字列に変換
   */
  private toAnki(cards: Flashcard[]): string {
    return cards.map(card => {
      let content = card.front;
      if (card.videoId && typeof card.startTime === 'number' && typeof card.endTime === 'number') {
        content += `<br><br><iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/${card.videoId}?start=${card.startTime}&end=${card.endTime}&autoplay=1"
  frameborder="0"
  autoplay="1"
/>`;
      }
      return `${content}\t${card.back}`;
    }).join('\n');
  }

  /**
   * 字幕を翻訳してフラッシュカードを生成
   */
  private async createTranslatedCards(texts: string[], sourceLang: string, targetLang: string): Promise<Flashcard[]> {
    if (!this.translator) {
      throw new Error('翻訳機能を使用するにはAPIキーが必要です');
    }

    const cards: Flashcard[] = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const translation = await this.translator.translate(texts[i], sourceLang, targetLang);
        const card: Flashcard = {
          front: translation,
          back: texts[i]
        };

        // YouTubeの動画情報が利用可能な場合、カードに追加
        if (this.videoId && this.startTimes && this.endTimes && i < this.startTimes.length) {
          card.videoId = this.videoId;
          card.startTime = this.startTimes[i];
          card.endTime = this.endTimes[i];
        }

        cards.push(card);
      } catch (error) {
        console.error(`翻訳エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // エラーが発生した場合でもスキップして続行
        continue;
      }
    }
    return cards;
  }
}