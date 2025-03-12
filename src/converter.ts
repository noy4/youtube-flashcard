import { Translator } from './translator.js';

export type OutputFormat = 'obsidian' | 'anki';

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
  private readonly MIN_CHARS = 100;  // より長い文脈を維持
  private readonly MAX_CHARS = 250;  // 最大文字数をさらに増やす

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
    const combinedSubtitles = this.combineSubtitles();
    return this.createTranslatedCards(combinedSubtitles, sourceLang, targetLang);
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

  /**
   * 字幕を意味のあるチャンクに結合
   */
  private combineSubtitles(): string[] {
    const result: string[] = [];
    let current: string[] = [];
    let currentLength = 0;

    const isEndOfSentence = (text: string): boolean => {
      return /[.!?](\s|$)/.test(text);
    };

    const isCompletePhrase = (text: string): boolean => {
      return !text.match(/\b(a|an|the|and|or|but|in|on|at|to|for)$/i);
    };

    const shouldAddPunctuation = (text: string): boolean => {
      return !isEndOfSentence(text) && isCompletePhrase(text);
    };

    const formatChunk = (chunk: string): string => {
      chunk = chunk.trim();
      // 文が完結していない場合は「...」を追加
      if (!isEndOfSentence(chunk) && isCompletePhrase(chunk)) {
        chunk += '...';
      } else if (shouldAddPunctuation(chunk)) {
        chunk += '.';
      }
      return chunk;
    };

    const addChunk = (force: boolean = false) => {
      if (current.length === 0) return true;

      let chunk = current.join(' ').trim();
      if (force || chunk.length >= this.MIN_CHARS) {
        // 最大文字数を超えている場合は、文の途中でも分割
        if (chunk.length > this.MAX_CHARS) {
          const words = chunk.split(' ');
          let tempChunk = '';
          let tempWords: string[] = [];

          for (const word of words) {
            if ((tempChunk + ' ' + word).length <= this.MAX_CHARS) {
              tempWords.push(word);
              tempChunk = tempWords.join(' ');
            } else {
              // 現在の単語を追加すると最大文字数を超える場合
              result.push(formatChunk(tempChunk));
              tempWords = [word];
              tempChunk = word;
            }
          }

          if (tempWords.length > 0) {
            result.push(formatChunk(tempWords.join(' ')));
          }
        } else {
          result.push(formatChunk(chunk));
        }
        current = [];
        currentLength = 0;
        return true;
      }
      return false;
    };

    for (const subtitle of this.subtitles) {
      current.push(subtitle.trim());
      currentLength += subtitle.length;

      if (currentLength >= this.MAX_CHARS ||
        (isEndOfSentence(subtitle) && currentLength >= this.MIN_CHARS)) {
        addChunk(true);
      }
    }

    // 残りの字幕を処理
    if (current.length > 0) {
      addChunk(true);
    }

    return result;
  }
}