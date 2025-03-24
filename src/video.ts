import type { Payload } from 'youtube-dl-exec'
import type { Context } from './context.js'
import * as fs from 'node:fs'
import { youtubeDl } from 'youtube-dl-exec'
import { execAsync, formatFileSize } from './utils.js'

export async function loadVideo(context: Context) {
  const { options, pathManager } = context
  const { input } = options
  const { paths } = pathManager

  if (!input)
    throw new Error('You must specify a video file path or YouTube URL.')

  console.log(`Loading ${input}...`)
  const isUrl = /^https?:\/\//.test(input)

  // download youtube video
  if (isUrl) {
    // get title
    const info = await youtubeDl(input, {
      dumpJson: true,
    }) as Payload
    context.videoTitle = info.title || ''
    context.videoSize = info.filesize_approx

    // download
    await youtubeDl(input, {
      output: paths.video,
      format: 'mp4',
    })
  }
  // load video file
  else {
    fs.copyFileSync(input, paths.video)
    context.videoTitle = input.split('/').pop()?.split('.')[0] || ''
    const stats = fs.statSync(paths.video)
    context.videoSize = stats.size
  }

  const size = formatFileSize(context.videoSize)
  console.log(`Video loaded: ${context.videoTitle} (${size})`)
}

export async function loadAudio(context: Context) {
  const { pathManager } = context
  const { paths } = pathManager

  if (fs.existsSync(paths.audio))
    return

  console.log('Extracting audio...')
  // ffmpeg options:
  // -i: Specify input file
  // -vn: Disable video stream (extract audio only)
  // -acodec libmp3lame: Use LAME MP3 encoder library (high-quality open-source MP3 encoder)
  // -q:a 4: Set audio quality (0-9, lower is higher quality)
  const command = `ffmpeg -i ${paths.video} -vn -acodec libmp3lame -q:a 4 "${paths.audio}"`
  await execAsync(command)

  // Get audio file size
  const stats = fs.statSync(paths.audio)
  context.audioSize = stats.size
  const audioSize = formatFileSize(context.audioSize)
  console.log(`Audio extracted: ${audioSize}`)
}
