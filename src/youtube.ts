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
  // ex. https://www.youtube.com/watch?v=VIDEO_ID
  // ex. https://youtu.be/VIDEO_ID
  const youtube_url_regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  const match = url.match(youtube_url_regex)

  if (!match)
    throw new Error('Invalid YouTube URL')

  return match[1]
}

/**
 * YouTubeの字幕を取得
 * @throws {Error} 字幕が見つからない場合やその他のエラー
 */
export async function fetchSubtitles(url: string, lang?: string): Promise<Subtitle[]> {
  const videoID = extractVideoId(url)
  const rawSubtitles = await getSubtitles({ videoID, lang })

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
