import type { Flashcard } from '../src/types.js'
import { describe, expect, it } from 'vitest'
import { FlashcardFormatter } from '../src/formatter.js'

describe('flashcardFormatter', () => {
  describe('toString', () => {
    const cards: Flashcard[] = [
      {
        front: 'Question 1',
        back: 'Answer 1',
        videoId: 'test123',
        start: 0,
        end: 10,
      },
      {
        front: 'Question 2',
        back: 'Answer 2',
        start: 10,
        end: 20,
      },
    ]

    it('obsidian形式で正しく出力する', () => {
      const result = FlashcardFormatter.toString(cards, 'obsidian')

      // タグの確認
      expect(result).toContain('#flashcards')

      // 1つ目のカードの確認
      expect(result).toContain('Question 1\n?\nAnswer 1')

      // 2つ目のカードの確認
      expect(result).toContain('Question 2\n?\nAnswer 2')

      // カード間が空行で区切られていることを確認
      expect(result).toMatch(/Answer 1\n\nQuestion 2/)

      // ハイフンによる区切りがないことを確認
      expect(result).not.toContain('---')
    })

    it('anki形式で正しく出力する', () => {
      const result = FlashcardFormatter.toString(cards, 'anki')
      const lines = result.split('\n')

      // 2行あることを確認
      expect(lines).toHaveLength(2)

      // 1行目のカードを確認
      expect(lines[0]).toContain('Question 1')
      expect(lines[0]).toContain('Answer 1')
      expect(lines[0]).toContain('<iframe')
      expect(lines[0]).toContain('src="https://www.youtube.com/embed/test123?start=0&end=10"')

      // 2行目のカードを確認
      expect(lines[1]).toContain('Question 2')
      expect(lines[1]).toContain('Answer 2')
      expect(lines[1]).not.toContain('<iframe')
    })

    it('jSON形式で正しく出力する', () => {
      const result = FlashcardFormatter.toString(cards, 'json')
      const parsed = JSON.parse(result)

      // 配列の長さを確認
      expect(parsed).toHaveLength(2)

      // ビデオ情報を含むカードの検証
      expect(parsed[0]).toEqual({
        front: 'Question 1',
        back: 'Answer 1',
        videoId: 'test123',
        start: 0,
        end: 10,
      })

      // ビデオ情報を含むが異なる時間のカードの検証
      expect(parsed[1]).toEqual({
        front: 'Question 2',
        back: 'Answer 2',
        start: 10,
        end: 20,
      })
    })

    it('不正なフォーマットでエラーを投げる', () => {
      expect(() => FlashcardFormatter.toString(cards, 'invalid' as any))
        .toThrow('Unsupported format: invalid')
    })
  })
})
