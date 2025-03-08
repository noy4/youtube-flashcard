interface Flashcard {
  front: string;
  back: string;
}

export class SubtitleConverter {
  private subtitles: string[];

  constructor(subtitles: string[]) {
    this.subtitles = subtitles;
  }

  /**
   * 字幕をObsidian Spaced Repetition形式のフラッシュカードに変換
   */
  public convert(): Flashcard[] {
    // TODO: 実際の変換ロジックを実装
    // 現在はダミーの実装
    return this.subtitles.map(subtitle => ({
      front: subtitle,
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
}