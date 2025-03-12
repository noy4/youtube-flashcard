import { Big } from 'big.js'
import { getSubtitles } from 'youtube-caption-extractor'

export interface Subtitle {
  text: string
  start: number
  end: number
  translation?: string
}

/**
 * YouTubeのURLから動画IDを抽出
 */
export function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  const match = url.match(regex)
  if (!match) {
    throw new Error('Invalid YouTube URL')
  }
  return match[1]
}

/**
 * YouTubeの字幕を取得
 * @throws {Error} 字幕が見つからない場合やその他のエラー
 */
export async function fetchSubtitles(url: string, _languageCode: string): Promise<Subtitle[]> {
  const videoID = extractVideoId(url)
  const rawSubtitles = await getSubtitles({ videoID })

  if (!rawSubtitles.length)
    throw new Error('字幕が見つかりませんでした')

  return rawSubtitles.map((subtitle) => {
    const start = new Big(subtitle.start)
    return {
      text: subtitle.text,
      start: +start,
      end: +start.plus(subtitle.dur),
    }
  })
}

/**
 * 利用可能な字幕の言語コードを取得
 * 現在は英語のみ対応
 */
export async function getAvailableLanguages(url: string): Promise<string[]> {
  const videoId = extractVideoId(url)

  try {
    const subtitles = await getSubtitles({ videoID: videoId })
    return subtitles && subtitles.length > 0 ? ['en'] : []
  }
  catch (error) {
    return []
  }
}
