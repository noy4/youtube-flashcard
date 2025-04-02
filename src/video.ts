import type { Payload } from 'youtube-dl-exec'
import type { Context } from './context.js'
import * as fs from 'node:fs'
import { youtubeDl } from 'youtube-dl-exec'
import { execAsync, formatFileSize } from './utils.js'

export async function loadVideo(context: Context) {
  const { options, pathManager } = context
  const { input } = options

  if (!input)
    throw new Error('You must specify a video file path or YouTube URL.')

  console.log(`Loading ${input}...`)
  const isUrl = /^https?:\/\//.test(input)

  // download youtube video
  if (isUrl) {
    const info = await youtubeDl(input, {
      dumpJson: true,
    }) as Payload
    const videoTitle = info.title || ''
    context.setState({ videoTitle })
    pathManager.initPaths(videoTitle)

    await youtubeDl(input, {
      output: pathManager.paths.video,
      format: 'mp4',
    })
  }
  // load video file
  else if (!context.videoTitle) {
    const videoTitle = input.split('/').pop()?.split('.')[0] || ''
    context.setState({ videoTitle })
    pathManager.initPaths(videoTitle)
    fs.copyFileSync(input, pathManager.paths.video)
  }

  const stats = fs.statSync(pathManager.paths.video)
  const size = formatFileSize(stats.size)
  console.log(`Video loaded: ${context.videoTitle} (${size})`)
}

export async function loadAudio(context: Context) {
  const { paths } = context

  if (fs.existsSync(paths.audio))
    return

  console.log('Extracting audio...')
  // ffmpeg options:
  // -i: Specify input file
  // -vn: Disable video stream (extract audio only)
  // -acodec libmp3lame: Use LAME MP3 encoder library (high-quality open-source MP3 encoder)
  // -q:a 4: Set audio quality (0-9, lower is higher quality)
  const command = `ffmpeg -i "${paths.video}" -vn -acodec libmp3lame -q:a 4 "${paths.audio}"`
  await execAsync(command)

  // Get audio file size
  const stats = fs.statSync(paths.audio)
  const audioSize = formatFileSize(stats.size)
  console.log(`Audio extracted: ${audioSize}`)
}
