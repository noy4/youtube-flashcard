import { Translator } from './translator.js';
import type { Subtitle } from './youtube.js';

export type OutputFormat = 'obsidian' | 'anki' | 'json';

interface Flashcard {
  front: string;
  back: string;
  videoId?: string;
  start: number;
  end: number;
}

export class SubtitleConverter {
  private translator: Translator | null;
  private subtitles: Subtitle[];

  constructor(
    subtitles: Subtitle[],
    private videoId?: string,
    apiKey?: string
  ) {
    this.translator = apiKey ? new Translator(apiKey) : null;
    this.subtitles = subtitles;
  }

  /**
   * 字幕をObsidian Spaced Repetition形式のフラッシュカードに変換
   * @param sourceLang 元の言語コード（例: 'en'）
   * @param targetLang 翻訳後の言語コード（例: 'ja'）
   */
  public async convert(sourceLang: string = 'en', targetLang: string = 'ja'): Promise<Flashcard[]> {
    if (!this.translator) {
      throw new Error('翻訳機能を使用するにはAPIキーが必要です');
    }

    const cards: Flashcard[] = [];
    for (const subtitle of this.subtitles) {
      try {
        const translation = await this.translator.translate(subtitle.text, sourceLang, targetLang);
        const card: Flashcard = {
          front: translation,
          back: subtitle.text,
          videoId: this.videoId,
          start: subtitle.start,
          end: subtitle.end
        };

        cards.push(card);
      } catch (error) {
        console.error(`翻訳エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // エラーが発生した場合でもスキップして続行
        continue;
      }
    }
    return cards;
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
      if (card.videoId && card.start && card.end) {
        const start = card.start;
        const end = card.end;
        content += `<br><br><iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/${card.videoId}?start=${start}&end=${end}&autoplay=1"
  frameborder="0"
  autoplay="1"
/>`;
      }
      return `${content}\t${card.back}`;
    }).join('\n');
  }
}