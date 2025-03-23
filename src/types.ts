import type { AIClient } from './ai.js'
import type { PathManager } from './path-manager.js'

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
  pathManager: PathManager
  subtitles: Subtitle[]
  videoTitle: string
  videoSize: number
  audioSize: number
}

export interface Subtitle {
  start: number
  end: number
  text: string
  translation: string
  audioPath?: string
}
