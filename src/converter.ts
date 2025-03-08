interface Flashcard {
  front: string;
  back: string;
}

export class SubtitleConverter {
  private subtitles: string[];
  private readonly MIN_CHARS = 50;   // 最小文字数
  private readonly MAX_CHARS = 120;  // 最大文字数を少し短く

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
   * 字幕を意味のあるチャンクに結合
   */
  private combineSubtitles(): string[] {
    const result: string[] = [];
    let current: string[] = [];
    let currentLength = 0;

    const isEndOfSentence = (text: string): boolean => {
      return /[.!?](\s|$)/.test(text);
    };

    const isNewContext = (text: string): boolean => {
      const markers = [
        'But', 'However', 'Now', 'So', 'Then', 'Finally',
        'First', 'Second', 'Next', 'Also', 'Instead',
        'For example', 'In addition'
      ];
      return markers.some(marker => text.startsWith(marker));
    };

    const addChunk = () => {
      if (current.length > 0) {
        const chunk = current.join(' ').trim();
        // 最小文字数以上の場合のみ追加
        if (chunk.length >= this.MIN_CHARS) {
          // 文末のピリオドを保持
          result.push(chunk + (chunk.endsWith('.') ? '' : '.'));
        }
        current = [];
        currentLength = 0;
      }
    };

    for (let i = 0; i < this.subtitles.length; i++) {
      const subtitle = this.subtitles[i].trim();
      const nextSubtitle = i < this.subtitles.length - 1 ? this.subtitles[i + 1].trim() : '';

      // 現在の字幕を追加
      current.push(subtitle);
      currentLength += subtitle.length;

      // チャンクを区切るべきかの判断
      const shouldSplit =
        // 最大文字数を超えた
        currentLength >= this.MAX_CHARS ||
        // 文末に達した上で、最小文字数を超えている
        (isEndOfSentence(subtitle) && currentLength >= this.MIN_CHARS) ||
        // 次の字幕が新しい文脈を示唆する上で、最小文字数を超えている
        (nextSubtitle && isNewContext(nextSubtitle) && currentLength >= this.MIN_CHARS);

      if (shouldSplit) {
        addChunk();
      }
    }

    // 残りの字幕があれば追加
    addChunk();

    return result.map(text => {
      // 文が完結していない場合、末尾に「...」を追加
      if (!isEndOfSentence(text)) {
        return text + '...';
      }
      return text;
    });
  }
}