import * as fs from 'node:fs'
import path from 'node:path'
import { ensureDirectory } from './utils.js'

const pathMap = {
  video: 'video.mp4',
  audio: 'audio.mp3',
  targetSrt: 'subs1.target.srt',
  nativeSrt: 'subs2.native.srt',
  segments: (index: number) => `segments/segment_${index}.mp3`,
}

const STATE_PATH = 'state.json'

type Paths = typeof pathMap

export class PathManager {
  base = 'output'
  paths!: Paths
  statePath = path.join(this.base, STATE_PATH)

  initPaths(dir: string) {
    const paths = Object.fromEntries(
      Object.entries(pathMap).map(([key, value]) => {
        if (typeof value === 'function') {
          return [
            key,
            (index: number) => this.withBase(dir, value(index)),
          ]
        }
        return [key, this.withBase(dir, value)]
      }),
    )
    this.paths = paths
  }

  initBase() {
    if (!fs.existsSync(this.base))
      fs.mkdirSync(this.base)
  }

  ensure(key: keyof Paths) {
    const filePath = this.paths[key]
    if (typeof filePath === 'function')
      ensureDirectory(filePath(0))
    else
      ensureDirectory(filePath)
  }

  withBase(...paths: string[]) {
    return path.join(this.base, ...paths)
  }
}
