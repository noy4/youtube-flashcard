import type { Payload } from 'youtube-dl-exec'
import type { Context, Options } from './types.js'
import * as fs from 'node:fs'
import { youtubeDl } from 'youtube-dl-exec'
import { AIClient } from './ai.js'
import { outputToAnki } from './anki.js'
import { loadSubtitles } from './subtitle.js'
import { ensureDirectory, execAsync, formatFileSize } from './utils.js'

export async function createFlashcards(options: Options) {
  // クリーンアップ: 既存のワークディレクトリを削除
  const workDir = '.youtube-flashcard'
  if (fs.existsSync(workDir))
    fs.rmSync(workDir, { recursive: true, force: true })

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
      video: '.youtube-flashcard/video.mp4',
      audio: '.youtube-flashcard/audio.mp3',
      subs1: '.youtube-flashcard/subs1.srt',
      subs2: '.youtube-flashcard/subs2.srt',
      segments: index => `.youtube-flashcard/segments/segment_${index}.mp3`,
    },
    subtitles: [],
    videoTitle: '',
    videoSize: 0,
    audioSize: 0,
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
  ensureDirectory(paths.audio)

  if (isUrl) {
    // get video title
    const info = await youtubeDl(input, {
      dumpJson: true,
    }) as Payload
    context.videoTitle = info.title || ''
    context.videoSize = info.filesize_approx

    // download video
    await youtubeDl(input, {
      output: paths.video,
      format: 'mp4',
    })
  }
  else {
    fs.copyFileSync(input, paths.video)
    context.videoTitle = input.split('/').pop()?.split('.')[0] || ''
    const stats = fs.statSync(paths.video)
    context.videoSize = stats.size
  }

  const size = formatFileSize(context.videoSize)
  console.log(`Video loaded: ${context.videoTitle} (${size})`)

  // Extract audio from video
  console.log('Extracting audio...')
  // ffmpeg options:
  // -i: 入力ファイルの指定
  // -vn: ビデオストリームを無効化（音声のみを抽出）
  // -acodec libmp3lame: MP3エンコーダーを使用
  // -q:a 4: 音声品質の設定（0-9, 低いほど高品質）
  const command = `ffmpeg -i ${paths.video} -vn -acodec libmp3lame -q:a 4 "${paths.audio}"`
  await execAsync(command)

  // Get audio file size
  const stats = fs.statSync(paths.audio)
  context.audioSize = stats.size
  const audioSize = formatFileSize(context.audioSize)
  console.log(`Audio extracted: ${audioSize}`)
}
