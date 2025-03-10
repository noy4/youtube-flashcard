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
    return cards.map((card, index) => {
      const cardContent = `#flashcard\n\nQ: ${card.front}\n\nA: ${card.back}`;
      return index < cards.length - 1 ? cardContent + '\n\n---\n\n' : cardContent;
    }).join('');
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
          front: text,
          back: translation
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
    let currentTopic: string | null = null;

    const isEndOfSentence = (text: string): boolean => {
      return /[.!?](\s|$)/.test(text);
    };

    const findTopic = (text: string): string | null => {
      const topics = [
        { name: 'intro', keywords: ['Expo', 'open source', 'Universal native apps'] },
        { name: 'native-dev', keywords: ['Swift', 'cotlin', 'Java', 'Objective C'] },
        { name: 'react-native', keywords: ['react native', 'JavaScript bridge'] },
        { name: 'project-setup', keywords: ['project template', 'configuration', 'npm'] },
        { name: 'routing', keywords: ['routing', 'navigation', 'screens', 'stack'] },
        { name: 'features', keywords: ['camera', 'APIs', 'Firebase', 'testing'] },
        { name: 'deployment', keywords: ['builds', 'Google play', 'App Store'] }
      ];

      for (const topic of topics) {
        if (topic.keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
          return topic.name;
        }
      }
      return null;
    };

    const isCompletePhrase = (text: string): boolean => {
      return !text.match(/\b(a|an|the|and|or|but|in|on|at|to|for)$/i);
    };

    const addChunk = (force: boolean = false) => {
      if (current.length > 0) {
        let chunk = current.join(' ').trim();
        // 最小文字数を満たすか、強制追加の場合
        if (force || chunk.length >= this.MIN_CHARS) {
          // 文が完結していない場合は、次の字幕も含める
          if (!isCompletePhrase(chunk) && current.length < this.subtitles.length) {
            return false;
          }
          result.push(chunk + (chunk.endsWith('.') ? '' : '.'));
          current = [];
          currentLength = 0;
          return true;
        }
        return false;
      }
      return true;
    };

    for (let i = 0; i < this.subtitles.length; i++) {
      const subtitle = this.subtitles[i].trim();
      const nextSubtitle = i < this.subtitles.length - 1 ? this.subtitles[i + 1].trim() : '';

      // トピックの検出
      const topic = findTopic(subtitle);
      if (topic && topic !== currentTopic && currentLength >= this.MIN_CHARS) {
        if (addChunk(true)) {
          currentTopic = topic;
        }
      }

      // 現在の字幕を追加
      current.push(subtitle);
      currentLength += subtitle.length;

      // チャンクを区切るべきかの判断
      const shouldSplit =
        currentLength >= this.MAX_CHARS ||
        (isEndOfSentence(subtitle) && currentLength >= this.MIN_CHARS && isCompletePhrase(subtitle));

      if (shouldSplit) {
        addChunk(currentLength >= this.MAX_CHARS);
      }
    }

    // 残りの字幕を処理
    if (current.length > 0) {
      addChunk(true);
    }

    return result.map(text => {
      // 文が完結していない場合、末尾に「...」を追加
      if (!isEndOfSentence(text)) {
        return text + '...';
      }
      return text;
    });
  }
}