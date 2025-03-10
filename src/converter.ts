import { Translator } from './translator.js';

interface Flashcard {
  front: string;
  back: string;
}

export class SubtitleConverter {
  private subtitles: string[];
  private translator: Translator | null;
  private readonly MIN_CHARS = 100;  // より長い文脈を維持
  private readonly MAX_CHARS = 250;  // 最大文字数をさらに増やす

  constructor(subtitles: string[], apiKey?: string) {
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
   * フラッシュカードをMarkdown形式の文字列に変換
   */
  public toMarkdown(cards: Flashcard[]): string {
    const header = '#flashcards\n\n';
    const content = cards.map(card => {
      return `${card.front}\n?\n${card.back}`;
    }).join('\n\n');
    return header + content;
  }

  /**
   * 字幕を翻訳してフラッシュカードを生成
   */
  private async createTranslatedCards(texts: string[], sourceLang: string, targetLang: string): Promise<Flashcard[]> {
    if (!this.translator) {
      throw new Error('翻訳機能を使用するにはAPIキーが必要です');
    }

    const cards: Flashcard[] = [];
    for (const text of texts) {
      try {
        const translation = await this.translator.translate(text, sourceLang, targetLang);
        cards.push({
          front: translation,
          back: text
        });
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