import type { Context, Options, Subtitle } from './types.js'
import * as fs from 'node:fs'
import path from 'node:path'
import { parseSync } from 'subtitle'
import { youtubeDl } from 'youtube-dl-exec'
import { AIClient } from './ai.js'
import { outputToAnki } from './anki.js'

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
  const { input } = context.options
  if (!input)
    throw new Error('ビデオファイルのパスまたはYouTube URLが指定されていません。')

  const isUrl = /^https?:\/\//.test(input)

  console.log(`Loading ${input}...`)

  if (isUrl) {
    await youtubeDl(input, {
      output: context.paths.video,
      format: 'mp4',
    })
  }
  else {
    if (!fs.existsSync(input))
      throw new Error(`${input} not found`)

    fs.copyFileSync(input, context.paths.video)
  }
}

function parseSubs(content: string) {
  return parseSync(content)
    .filter(node => node.type === 'cue')
    .map(v => v.data)
}

async function loadSubtitle(params: {
  input?: string
  output: string
  generate: () => Promise<string>
}) {
  const { input, output, generate } = params

  if (input) {
    if (!fs.existsSync(input))
      throw new Error(`${input} not found`)

    return fs.readFileSync(input, 'utf-8')
  }
  else {
    const content = await generate()
    fs.writeFileSync(output, content)
    return content
  }
}

// 文字起こしの読み込み
async function loadSubtitles(context: Context) {
  const { options, paths } = context

  const subs1Content = await loadSubtitle({
    input: options.subs1,
    output: paths.subs1,
    generate: async () => {
      const transcription = await context.ai.transcribe({
        audioPath: paths.video,
        language: options.fromLang,
      })
      return transcription
    },
  })

  const subs2Content = await loadSubtitle({
    input: options.subs2,
    output: paths.subs2,
    generate: async () => {
      const translation = await context.ai.translate({
        content: subs1Content,
        fromLang: options.fromLang,
        toLang: options.toLang,
      })
      return translation
    },
  })

  const subs1 = parseSubs(subs1Content)
  const subs2 = parseSubs(subs2Content)

  const subtitles: Subtitle[] = []
  for (const [index, sub] of subs1.entries()) {
    subtitles.push({
      ...sub,
      translation: subs2[index].text,
      audioPath: path.join(paths.segments, `segment_${index}.mp3`),
    })
  }
  context.subtitles = subtitles
}

export async function createFlashcards(options: Options) {
  const context = createContext(options)
  setupOutputDirectory()
  await loadVideo(context)
  await loadSubtitles(context)

  if (options.addToAnki)
    await outputToAnki(context)

  console.log('Done.')
}
