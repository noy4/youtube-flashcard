import type { Options, Subtitle } from './types.js'
import * as fs from 'node:fs'
import { AIClient } from './ai.js'
import { PathManager } from './path-manager.js'

interface State {
  videoTitle: string
}

export class Context {
  options: Options
  ai: AIClient
  pathManager: PathManager
  paths: PathManager['paths']
  subtitles: Subtitle[] = []
  videoTitle = ''
  videoSize = 0
  audioSize = 0

  constructor(options: Options) {
    this.loadState()
    this.options = options
    this.ai = new AIClient(options)
    this.pathManager = new PathManager()
    this.paths = this.pathManager.paths
  }

  setState(props: Partial<State>) {
    Object.assign(this, props)
    const state = {
      videoTitle: this.videoTitle,
    }
    fs.writeFileSync(
      this.paths.state,
      JSON.stringify(state, null, 2),
      'utf-8',
    )
  }

  loadState() {
    if (fs.existsSync(this.paths.state)) {
      const data = fs.readFileSync(this.paths.state, 'utf-8')
      const parsed = JSON.parse(data)
      Object.assign(this, parsed)
    }
  }
}
