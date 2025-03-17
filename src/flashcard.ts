import type { Payload } from 'youtube-dl-exec'
import type { Context, Options } from './types.js'
import * as fs from 'node:fs'
import { youtubeDl } from 'youtube-dl-exec'
import { AIClient } from './ai.js'
import { outputToAnki } from './anki.js'
import { loadSubtitles } from './subtitle.js'
import { ensureDirectory } from './utils.js'

export async function createFlashcards(options: Options) {
  const context = createContext(options)
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
      segments: index => `output/segments/segment_${index}.mp3`,
    },
    subtitles: [],
    videoTitle: '',
  }
}

// ビデオの読み込み処理
async function loadVideo(context: Context) {
  const { options, paths } = context
  const { input } = options

  if (!input)
    throw new Error('You must specify a video file path or YouTube URL.')

  const isUrl = /^https?:\/\//.test(input)
  console.log(`Loading ${input}...`)
  ensureDirectory(paths.video)

  if (isUrl) {
    // get video title
    const info = await youtubeDl(input, {
      dumpJson: true,
    }) as Payload
    context.videoTitle = info.title || ''

    // download video
    await youtubeDl(input, {
      output: paths.video,
      format: 'mp4',
    })
  }
  else {
    fs.copyFileSync(input, paths.video)
    context.videoTitle = input.split('/').pop()?.split('.')[0] || ''
  }
}
