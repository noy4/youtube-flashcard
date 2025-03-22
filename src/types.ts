import type { AIClient } from './ai.js'

export interface Options {
  input?: string | undefined
  subs1?: string | undefined
  subs2?: string | undefined
  fromLang: string
  toLang: string
  addToAnki?: true | undefined
  deckName?: string
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
    segments: (index: number) => string
  }
  subtitles: Subtitle[]
  videoTitle: string
  videoSize: number
}

export interface Subtitle {
  start: number
  end: number
  text: string
  translation: string
  audioPath?: string
}
