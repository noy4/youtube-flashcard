import type { Options, Subtitle } from './types.js'
import { AIClient } from './ai.js'
import { PathManager } from './path-manager.js'

export interface Context {
  options: Options
  ai: AIClient
  pathManager: PathManager
  subtitles: Subtitle[]
  videoTitle: string
  videoSize: number
  audioSize: number
}

export function createContext(options: Options): Context {
  return {
    options,
    ai: new AIClient(options),
    pathManager: new PathManager(),
    subtitles: [],
    videoTitle: '',
    videoSize: 0,
    audioSize: 0,
  }
}
