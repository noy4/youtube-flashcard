import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSubtitles } from 'youtube-caption-extractor'
import { extractVideoId, fetchSubtitles, getAvailableLanguages } from '../src/youtube.js'

// youtube-caption-extractorをモック化
vi.mock('youtube-caption-extractor', () => ({
  getSubtitles: vi.fn(),
  getVideoDetails: vi.fn(),
}))

describe('youTube機能のテスト', () => {
  describe('extractVideoId', () => {
    it('通常のYouTube URLからvideoIdを抽出できる', () => {
      const url = 'https://www.youtube.com/watch?v=abcd1234'
      expect(extractVideoId(url)).toBe('abcd1234')
    })

    it('短縮URLからvideoIdを抽出できる', () => {
      const url = 'https://youtu.be/abcd1234'
      expect(extractVideoId(url)).toBe('abcd1234')
    })

    it('クエリパラメータが追加されたURLからvideoIdを抽出できる', () => {
      const url = 'https://www.youtube.com/watch?v=abcd1234&t=120'
      expect(extractVideoId(url)).toBe('abcd1234')
    })

    it('無効なURLの場合はエラーを投げる', () => {
      const url = 'https://example.com'
      expect(() => extractVideoId(url)).toThrow('Invalid YouTube URL')
    })
  })

  describe('fetchSubtitles', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('字幕を正常に取得できる', async () => {
      const mockSubtitles = [
        { text: 'First subtitle', start: '0.0', dur: '1.0' },
        { text: 'Second subtitle', start: '1.0', dur: '1.0' },
      ];
      (getSubtitles as any).mockResolvedValue(mockSubtitles)

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      const result = await fetchSubtitles(url, 'en')

      expect(result).toEqual([
        { text: 'First subtitle', start: 0.0, end: 1.0 },
        { text: 'Second subtitle', start: 1.0, end: 2.0 },
      ])
      expect(getSubtitles).toHaveBeenCalledWith({ videoID: 'abcd1234' })
    })

    it('字幕が見つからない場合はエラーを投げる', async () => {
      (getSubtitles as any).mockResolvedValue([])

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      await expect(fetchSubtitles(url, 'en')).rejects.toThrow('字幕が見つかりませんでした')
    })

    it('aPIエラーの場合はエラーを投げる', async () => {
      (getSubtitles as any).mockRejectedValue(new Error('API Error'))

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      await expect(fetchSubtitles(url, 'en')).rejects.toThrow()
    })
  })

  describe('getAvailableLanguages', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('字幕が利用可能な場合は言語コードを返す', async () => {
      const mockSubtitles = [{ text: 'Subtitle' }];
      (getSubtitles as any).mockResolvedValue(mockSubtitles)

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      const result = await getAvailableLanguages(url)

      expect(result).toEqual(['en'])
    })

    it('字幕が利用できない場合は空配列を返す', async () => {
      (getSubtitles as any).mockResolvedValue([])

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      const result = await getAvailableLanguages(url)

      expect(result).toEqual([])
    })

    it('エラーが発生した場合は空配列を返す', async () => {
      (getSubtitles as any).mockRejectedValue(new Error('API Error'))

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      const result = await getAvailableLanguages(url)

      expect(result).toEqual([])
    })
  })
})
