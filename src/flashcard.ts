import * as fs from 'node:fs'
import OpenAI from 'openai'
import { youtubeDl } from 'youtube-dl-exec'
import { outputToAnki } from './anki-v2.js'

export interface Options {
  input?: string | undefined
  output: string
  format: string
  subs1?: string | undefined
  subs2?: string | undefined
  fromLang: string
  toLang: string
  addToAnki?: true | undefined
  deckName: string
  modelName: string
  apiKey: string
  baseUrl: string
  model: string
}

export interface Context {
  options: Options
  openai: OpenAI
  paths: {
    video: string
    subs1: string
    subs2: string
  }
  subs1Content: string
  subs2Content: string
}

function createContext(options: Options): Context {
  return {
    options,
    openai: new OpenAI({ apiKey: options.apiKey }),
    paths: {
      video: 'output/video.mp4',
      subs1: 'output/subs1.srt',
      subs2: 'output/subs2.srt',
    },
    subs1Content: '',
    subs2Content: '',
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

// 字幕のOpenAI翻訳
async function translateWithOpenAI(context: Context) {
  const { options, openai, subs1Content } = context

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a skilled translator from ${options.fromLang} to ${options.toLang}. Your task is to accurately translate each subtitle segment while preserving the timing information. Keep the SRT format intact.`,
      },
      {
        role: 'user',
        content: subs1Content,
      },
    ],
  })

  return response.choices[0].message.content || ''
}

// 文字起こしの読み込み
async function loadTranscription(context: Context) {
  const { options, paths } = context
  const openai = new OpenAI({ apiKey: options.apiKey })

  // 字幕1の読み込み
  if (options.subs1) {
    if (!fs.existsSync(options.subs1))
      throw new Error(`${options.subs1} not found`)

    context.subs1Content = fs.readFileSync(options.subs1, 'utf-8')
  }
  else {
    // OpenAIで文字起こしを生成
    const file = fs.createReadStream(paths.video)
    console.log('Transcribing audio...')
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'srt',
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
    // OpenAIで翻訳を生成
    console.log('Translating subtitles...')
    const translation = await translateWithOpenAI(context)
    context.subs2Content = translation
    fs.writeFileSync(paths.subs2, translation)
  }
}

export async function createFlashcards(options: Options) {
  const context = createContext(options)
  setupOutputDirectory()
  await loadVideo(context)
  await loadTranscription(context)

  if (options.addToAnki)
    await outputToAnki(context)

  console.log('Done.')
}
