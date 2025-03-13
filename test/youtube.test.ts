import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSubtitles } from 'youtube-caption-extractor'
import { extractVideoId, fetchSubtitles } from '../src/youtube.js'

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
      expect(getSubtitles).toHaveBeenCalledWith({ videoID: 'abcd1234', lang: 'en' })
    })

    it('字幕が見つからない場合はエラーを投げる', async () => {
      (getSubtitles as any).mockResolvedValue([])

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      await expect(fetchSubtitles(url, 'en')).rejects.toThrow('字幕が見つかりませんでした')
    })

    it('api エラーの場合はエラーを投げる', async () => {
      (getSubtitles as any).mockRejectedValue(new Error('API Error'))

      const url = 'https://www.youtube.com/watch?v=abcd1234'
      await expect(fetchSubtitles(url, 'en')).rejects.toThrow()
    })
  })
})
