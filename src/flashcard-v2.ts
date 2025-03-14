import { youtubeDl } from 'youtube-dl-exec'

export interface Options {
  input?: string | undefined
  output: string
  format: string
  fromLang: string
  toLang: string
  addToAnki?: true | undefined
  deckName: string
  modelName: string
  apiKey: string
  baseUrl: string
  model: string
}

export async function createFlashcardsV2(
  url: string | undefined,
  _options: Options,
) {
  console.log('字幕のダウンロードを開始します...')
  try {
    const result = await youtubeDl(url!, {
      // skipDownload: true,
      // writeSub: true,
      // subLang: 'ja,en',
      output: '%(id)s.%(ext)s',
      format: 'best',
    })
    console.log('ダウンロード結果:', result)
    return result
  }
  catch (error) {
    console.error('エラーが発生しました:', error)
    throw error
  }
}
