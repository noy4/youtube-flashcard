import type { Options, Subtitle } from './types.js'
import * as fs from 'node:fs'
import { AIClient } from './ai.js'
import { PathManager } from './path-manager.js'

export interface Context {
  options: Options
  ai: AIClient
  pathManager: PathManager
  subtitles: Subtitle[]
  // videoTitle: string
  videoSize: number
  audioSize: number
  state: State
}

export function createContext(options: Options): Context {
  const pathManager = new PathManager()
  const state = new State(pathManager.paths.state)

  return {
    options,
    ai: new AIClient(options),
    pathManager,
    subtitles: [],
    // videoTitle: '',
    videoSize: 0,
    audioSize: 0,
    state,
  }
}

class State {
  videoTitle = ''

  constructor(public path: string) {
    this.load()
  }

  load() {
    if (fs.existsSync(this.path)) {
      const data = fs.readFileSync(this.path, 'utf-8')
      const parsed = JSON.parse(data)
      Object.assign(this, parsed)
    }
  }

  set(props: Partial<State>) {
    Object.assign(this, props)
    fs.writeFileSync(this.path, JSON.stringify(this, null, 2), 'utf-8')
  }
}
