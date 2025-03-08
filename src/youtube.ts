import { getSubtitles } from 'youtube-caption-extractor';

interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

/**
 * YouTubeのURLから動画IDを抽出
 */
export function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error('Invalid YouTube URL');
  }
  return match[1];
}

/**
 * YouTubeの字幕を取得
 */
export async function fetchSubtitles(url: string, languageCode: string): Promise<string[]> {
  const videoId = extractVideoId(url);
  const subtitles = await getSubtitles({ videoID: videoId, lang: languageCode });
  return subtitles.map(subtitle => subtitle.text);
}