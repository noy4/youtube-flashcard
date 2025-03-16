import type { Context, Options } from './types.js'
import * as fs from 'node:fs'
import { youtubeDl } from 'youtube-dl-exec'
import { AIClient } from './ai.js'
import { outputToAnki } from './anki.js'
import { loadSubtitles } from './subtitle.js'

export async function createFlashcards(options: Options) {
  const context = createContext(options)
  setupOutputDirectory()
  await loadVideo(context)
  await loadSubtitles(context)

  if (options.addToAnki)
    await outputToAnki(context)

  console.log('Done.')
}

function createContext(options: Options): Context {
  return {
    options,
    ai: new AIClient(options.apiKey),
    paths: {
      video: 'output/video.mp4',
      subs1: 'output/subs1.srt',
      subs2: 'output/subs2.srt',
      segments: 'output/segments',
    },
    subtitles: [],
  }
}

// 出力フォルダを準備
function setupOutputDirectory() {
  if (!fs.existsSync('output'))
    fs.mkdirSync('output', { recursive: true })
}

// ビデオの読み込み処理
async function loadVideo(context: Context) {
  const { options, paths } = context
  const { input } = options

  if (!input)
    throw new Error('ビデオファイルのパスまたはYouTube URLが指定されていません。')

  const isUrl = /^https?:\/\//.test(input)

  console.log(`Loading ${input}...`)

  if (isUrl) {
    await youtubeDl(input, {
      output: paths.video,
      format: 'mp4',
    })
  }
  else {
    fs.copyFileSync(input, paths.video)
  }
}
