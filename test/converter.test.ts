import type { Subtitle } from '../src/youtube.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubtitleConverter } from '../src/converter.js'

function createSubtitles(texts: string[]): Subtitle[] {
  return texts.map((text, i) => ({
    text,
    start: i * 10,
    end: (i * 10) + 10,
  }))
}

// Translatorのモック
vi.mock('../src/translator.js', () => ({
  Translator: vi.fn().mockImplementation((options) => {
    if (!options?.apiKey) {
      throw new Error('OpenRouter APIキーが必要です')
    }
    return {
      translate: vi.fn().mockImplementation(async (subtitles) => {
        return subtitles.map(subtitle => ({
          ...subtitle,
          translation: `Translated: ${subtitle.text}`,
        }))
      }),
    }
  }),
}))

describe('subtitleConverter', () => {
  describe('翻訳統合', () => {
    let converter: SubtitleConverter
    const originalSubtitles = createSubtitles(['This is a test sentence.'])

    beforeEach(() => {
      converter = new SubtitleConverter(originalSubtitles, 'test-video-id', {
        apiKey: 'test-api-key',
      })
    })

    it('aPIキーがある場合は翻訳を実行する', async () => {
      const cards = await converter.convert('en', 'ja')

      expect(cards).toHaveLength(1)
      expect(cards[0].front).toBe('Translated: This is a test sentence.')
      expect(cards[0].back).toBe('This is a test sentence.')
    })

    it('aPIキーがない場合はエラーを投げる', async () => {
      await expect(async () => {
        const converter = new SubtitleConverter(originalSubtitles, 'test-video-id')
        await converter.convert('en', 'ja')
      }).rejects.toThrow('OpenRouter APIキーが必要です')
    })
  })

  describe('エッジケース', () => {
    it('空の字幕配列を処理できる', async () => {
      const converter = new SubtitleConverter([], 'test-video-id', {
        apiKey: 'test-api-key',
      })
      const cards = await converter.convert('en', 'ja')
      expect(cards).toHaveLength(0)
    })
  })
})
