import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubtitleConverter } from '../src/converter.js';
import { Translator } from '../src/translator.js';

// Translatorのモック
vi.mock('../src/translator.js', () => ({
  Translator: vi.fn().mockImplementation(() => ({
    translate: vi.fn().mockImplementation((text) => Promise.resolve(`Translated: ${text}`))
  }))
}));

describe('SubtitleConverter', () => {
  describe('基本的な変換機能', () => {
    it('字幕を適切な長さのチャンクに結合する', () => {
      const sentence = "This is a relatively long test sentence that helps ensure we meet the minimum character requirement for each chunk. ";
      const subtitles = Array(10).fill(sentence); // 十分な長さのテストデータ

      const converter = new SubtitleConverter(subtitles);
      const result = (converter as any).combineSubtitles();

      // MIN_CHARSを超えるまで結合されているか確認
      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((chunk: string) => {
        expect(chunk.length).toBeGreaterThanOrEqual((converter as any).MIN_CHARS);
      });

      // MAX_CHARSを超えていないか確認
      result.forEach((chunk: string) => {
        expect(chunk.length).toBeLessThanOrEqual((converter as any).MAX_CHARS);
      });
    });

    it('不完全な文の末尾に...を追加する', () => {
      const subtitles = [
        "This is an incomplete",
        "sentence that ends in",
        "a way that seems unfinished"
      ];
      const converter = new SubtitleConverter(subtitles);
      const result = (converter as any).combineSubtitles();

      expect(result[0]).toMatch(/.*\.\.\./);
    });

    it('最大文字数を超える字幕を適切に分割する', () => {
      // 非常に長い文章を作成（MAX_CHARSの2倍以上）
      const longText = 'This is a very long sentence. '.repeat(20);
      const subtitles = [longText];
      const converter = new SubtitleConverter(subtitles);
      const result = (converter as any).combineSubtitles();

      // 少なくとも1回は分割されているはず
      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk: string) => {
        expect(chunk.length).toBeLessThanOrEqual((converter as any).MAX_CHARS);
      });
    });
  });

  describe('Markdown変換', () => {
    it('フラッシュカードを正しいMarkdown形式に変換する', () => {
      const converter = new SubtitleConverter([]);
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
    const subtitles = ["This is a test sentence."];

    beforeEach(() => {
      converter = new SubtitleConverter(subtitles, 'test-api-key');
    });

    it('APIキーがある場合は翻訳を実行する', async () => {
      const cards = await converter.convert('en', 'ja');

      expect(cards).toHaveLength(1);
      expect(cards[0].front).toBe("This is a test sentence.");
      expect(cards[0].back).toBe("Translated: This is a test sentence.");
    });

    it('APIキーがない場合はエラーを投げる', async () => {
      const converter = new SubtitleConverter(subtitles);

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
      converter = new SubtitleConverter([]);
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
    it('空の字幕配列を処理できる', () => {
      const converter = new SubtitleConverter([]);
      const result = (converter as any).combineSubtitles();

      expect(result).toHaveLength(0);
    });

    it('最小文字数未満の字幕を適切に処理する', () => {
      const shortSubtitles = ["Short", "text", "here."];
      const converter = new SubtitleConverter(shortSubtitles);
      const result = (converter as any).combineSubtitles();

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("Short text here.");
    });

    it('最大文字数を超える字幕を適切に分割する', () => {
      const longSubtitle = Array(10).fill("This is a very long sentence that needs to be split.").join(" ");
      const converter = new SubtitleConverter([longSubtitle]);
      const result = (converter as any).combineSubtitles();

      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk: string) => {
        expect(chunk.length).toBeLessThanOrEqual((converter as any).MAX_CHARS);
      });
    });
  });
});