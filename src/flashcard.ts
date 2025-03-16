import * as fs from 'node:fs'
import path from 'node:path'
import { parseSync } from 'subtitle'
import { youtubeDl } from 'youtube-dl-exec'
import { AIClient } from './ai.js'
import { outputToAnki } from './anki.js'

export interface Options {
  input?: string | undefined
  subs1?: string | undefined
  subs2?: string | undefined
  fromLang: string
  toLang: string
  addToAnki?: true | undefined
  deckName: string
  modelName: string
  apiKey: string
}

export interface Context {
  options: Options
  ai: AIClient
  paths: {
    video: string
    subs1: string
    subs2: string
    segments: string
  }
  subs1Content: string
  subs2Content: string
  subtitles: Subtitle[]
}

export interface Subtitle {
  start: number
  end: number
  text: string
  translation: string
  audioPath?: string
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
    subs1Content: '',
    subs2Content: '',
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

// 文字起こしの読み込み
async function loadSubtitles(context: Context) {
  const { options, paths } = context

  // 字幕1の読み込み
  if (options.subs1) {
    if (!fs.existsSync(options.subs1))
      throw new Error(`${options.subs1} not found`)

    context.subs1Content = fs.readFileSync(options.subs1, 'utf-8')
  }
  else {
    // AIで文字起こしを生成
    const transcription = await context.ai.transcribe({
      audioPath: paths.video,
      language: options.fromLang,
    })
    context.subs1Content = transcription
    fs.writeFileSync(paths.subs1, transcription)
  }

  // 字幕2の読み込み
  if (options.subs2) {
    if (!fs.existsSync(options.subs2))
      throw new Error(`${options.subs2} not found`)

    context.subs2Content = fs.readFileSync(options.subs2, 'utf-8')
  }
  else {
    // AIで翻訳を生成
    const translation = await context.ai.translate({
      content: context.subs1Content,
      fromLang: options.fromLang,
      toLang: options.toLang,
    })
    context.subs2Content = translation
    fs.writeFileSync(paths.subs2, translation)
  }

  const subs1 = parseSubs(context.subs1Content)
  const subs2 = parseSubs(context.subs2Content)

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
