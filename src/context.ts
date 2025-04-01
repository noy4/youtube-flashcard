import type { Options, Subtitle } from './types.js'
import * as fs from 'node:fs'
import { AIClient } from './ai.js'
import { PathManager } from './path.js'

interface State {
  videoTitle: string
}

export class Context {
  options: Options
  ai: AIClient
  pathManager: PathManager
  subtitles: Subtitle[] = []
  videoTitle = ''
  audioSize = 0

  constructor(options: Options) {
    this.options = options
    this.ai = new AIClient(options)
    this.pathManager = new PathManager()
    this.pathManager.initBase()

    if (options.useCache) {
      console.log('Using cached files...')
      this.loadState()
      this.pathManager.initPaths(this.videoTitle)
      this.options.input ||= this.paths.video
      this.options.targetSrt ||= this.paths.targetSrt
      this.options.nativeSrt ||= this.paths.nativeSrt
    }
  }

  get paths() {
    return this.pathManager.paths
  }

  setState(props: Partial<State>) {
    Object.assign(this, props)
    const state = {
      videoTitle: this.videoTitle,
    }
    fs.writeFileSync(
      this.pathManager.statePath,
      JSON.stringify(state, null, 2),
      'utf-8',
    )
  }

  loadState() {
    if (fs.existsSync(this.pathManager.statePath)) {
      const data = fs.readFileSync(this.pathManager.statePath, 'utf-8')
      const parsed = JSON.parse(data)
      Object.assign(this, parsed)
    }
  }
}
