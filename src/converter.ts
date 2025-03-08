interface Flashcard {
  front: string;
  back: string;
}

export class SubtitleConverter {
  private subtitles: string[];
  private readonly MIN_WORDS = 5;  // 最小単語数
  private readonly MAX_WORDS = 15; // 最大単語数

  constructor(subtitles: string[]) {
    this.subtitles = subtitles;
  }

  /**
   * 字幕をObsidian Spaced Repetition形式のフラッシュカードに変換
   */
  public convert(): Flashcard[] {
    const combinedSubtitles = this.combineSubtitles();
    return combinedSubtitles.map(text => ({
      front: text,
      back: "Translation will be implemented"
    }));
  }

  /**
   * フラッシュカードをMarkdown形式の文字列に変換
   */
  public toMarkdown(cards: Flashcard[]): string {
    return cards.map(card => (
      `#flashcard\nQ: ${card.front}\nA: ${card.back}\n`
    )).join('\n---\n\n');
  }

  /**
   * 字幕を適切な長さに結合
   * 短すぎる字幕は結合し、長すぎる字幕は分割します
   */
  private combineSubtitles(): string[] {
    const result: string[] = [];
    let current = '';

    for (const subtitle of this.subtitles) {
      const words = subtitle.split(' ');

      if (current) {
        const currentWords = current.split(' ');

        // 現在の蓄積が最大単語数を超えている場合、新しいカードを作成
        if (currentWords.length >= this.MAX_WORDS) {
          result.push(current);
          current = subtitle;
          continue;
        }

        // 単語を結合して適切な長さになるまで蓄積
        current = `${current} ${subtitle}`;
        if (currentWords.length >= this.MIN_WORDS) {
          result.push(current);
          current = '';
        }
      } else {
        if (words.length >= this.MIN_WORDS) {
          result.push(subtitle);
        } else {
          current = subtitle;
        }
      }
    }

    // 残りの字幕があれば追加
    if (current) {
      result.push(current);
    }

    return result.map(text => text.trim());
  }
}