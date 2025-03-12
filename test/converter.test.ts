import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubtitleConverter } from '../src/converter.js';
import { Translator } from '../src/translator.js';
import type { Subtitle } from '../src/youtube.js';

const createSubtitles = (texts: string[]): Subtitle[] => {
  return texts.map((text, i) => ({
    text,
    start: String(i * 10),
    dur: '10'
  }));
};

// Translatorのモック
vi.mock('../src/translator.js', () => ({
  Translator: vi.fn().mockImplementation((apiKey) => {
    if (!apiKey) {
      throw new Error('OpenRouter APIキーが必要です');
    }
    return {
      translate: vi.fn().mockImplementation((text) => Promise.resolve(`Translated: ${text}`))
    };
  })
}));

describe('SubtitleConverter', () => {
  describe('Markdown変換', () => {
    it('フラッシュカードを正しいMarkdown形式に変換する', () => {
      const converter = new SubtitleConverter(createSubtitles([]));
      const cards = [
        { front: "Question 1", back: "Answer 1" },
        { front: "Question 2", back: "Answer 2" }
      ];

      const markdown = converter.toString(cards, 'obsidian');

      // タグの確認
      expect(markdown).toContain('#flashcards');

      // 1つ目のカードの確認
      expect(markdown).toContain('Question 1\n?\nAnswer 1');

      // 2つ目のカードの確認
      expect(markdown).toContain('Question 2\n?\nAnswer 2');

      // カード間が空行で区切られていることを確認
      expect(markdown).toMatch(/Answer 1\n\nQuestion 2/);

      // ハイフンによる区切りがないことを確認
      expect(markdown).not.toContain('---');
    });
  });

  describe('翻訳統合', () => {
    let converter: SubtitleConverter;
    const originalSubtitles = createSubtitles(["This is a test sentence."]);

    beforeEach(() => {
      converter = new SubtitleConverter(originalSubtitles, 'test-video-id', 'test-api-key');
    });

    it('APIキーがある場合は翻訳を実行する', async () => {
      const cards = await converter.convert('en', 'ja');

      expect(cards).toHaveLength(1);
      expect(cards[0].front).toBe("Translated: This is a test sentence.");
      expect(cards[0].back).toBe("This is a test sentence.");
    });

    it('APIキーがない場合はエラーを投げる', async () => {
      const converter = new SubtitleConverter(originalSubtitles);

      await expect(converter.convert('en', 'ja'))
        .rejects
        .toThrow('翻訳機能を使用するにはAPIキーが必要です');
    });
  });

  describe('出力フォーマット', () => {
    let converter: SubtitleConverter;
    const cards = [
      {
        front: "Question 1",
        back: "Answer 1",
        videoId: "test123",
        startTime: 0,
        endTime: 10
      },
      {
        front: "Question 2",
        back: "Answer 2"
      }
    ];

    beforeEach(() => {
      converter = new SubtitleConverter(createSubtitles([]));
    });

    it('JSON形式で正しく出力する', () => {
      const result = converter.toString(cards, 'json');
      const parsed = JSON.parse(result);

      // 配列の長さを確認
      expect(parsed).toHaveLength(2);

      // ビデオ情報を含むカードの検証
      expect(parsed[0]).toEqual({
        front: "Question 1",
        back: "Answer 1",
        videoId: "test123",
        startTime: 0,
        endTime: 10
      });

      // ビデオ情報を含まないカードの検証
      expect(parsed[1]).toEqual({
        front: "Question 2",
        back: "Answer 2"
      });
    });
  });

  describe('エッジケース', () => {
    it('空の字幕配列を処理できる', async () => {
      const converter = new SubtitleConverter(createSubtitles([]), 'test-video-id', 'test-api-key');
      const cards = await converter.convert('en', 'ja');
      expect(cards).toHaveLength(0);
    });
  });
});