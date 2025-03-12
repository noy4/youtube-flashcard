import { getSubtitles, getVideoDetails } from 'youtube-caption-extractor';

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
 * @throws {Error} 字幕が見つからない場合やその他のエラー
 */
export interface SubtitleData {
  texts: string[];
  startTimes: number[];
  endTimes: number[];
}

export async function fetchSubtitles(url: string, languageCode: string): Promise<SubtitleData> {
  const videoId = extractVideoId(url);

  try {
    // 字幕を取得（現在は英語のみ対応）
    const subtitles = await getSubtitles({ videoID: videoId });
    if (!subtitles || subtitles.length === 0) {
      throw new Error('字幕が見つかりませんでした');
    }

    const texts = subtitles.map(subtitle => subtitle.text);
    const startTimes = subtitles.map(subtitle => parseFloat(subtitle.start));
    const endTimes = subtitles.map(subtitle =>
      parseFloat(subtitle.start) + parseFloat(subtitle.dur)
    );

    return { texts, startTimes, endTimes };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('字幕の取得中に予期せぬエラーが発生しました');
  }
}

/**
 * 利用可能な字幕の言語コードを取得
 * 現在は英語のみ対応
 */
export async function getAvailableLanguages(url: string): Promise<string[]> {
  const videoId = extractVideoId(url);

  try {
    const subtitles = await getSubtitles({ videoID: videoId });
    return subtitles && subtitles.length > 0 ? ['en'] : [];
  } catch (error) {
    return [];
  }
}