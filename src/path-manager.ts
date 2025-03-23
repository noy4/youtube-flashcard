import * as fs from 'node:fs'
import path from 'node:path'
import { ensureDirectory } from './utils.js'

const pathMap = {
  video: 'video.mp4',
  audio: 'audio.mp3',
  subs1: 'subs1.srt',
  subs2: 'subs2.srt',
  segments: (index: number) => `segments/segment_${index}.mp3`,
}

type Paths = typeof pathMap

/**
 * ファイルパスの管理を担当するクラス
 */
export class PathManager {
  workDir = '.youtube-flashcard'
  paths = this.createPaths(pathMap)

  createPaths(paths: Paths): Paths {
    return Object.fromEntries(
      Object.entries(paths).map(([key, value]) => {
        if (typeof value === 'function') {
          return [
            key,
            (index: number) => this.withBase(value(index)),
          ]
        }
        return [key, this.withBase(value)]
      }),
    )
  }

  init() {
    if (fs.existsSync(this.workDir))
      fs.rmSync(this.workDir, { recursive: true, force: true })
  }

  ensure(key: keyof Paths) {
    const filePath = this.paths[key]
    if (typeof filePath === 'function')
      ensureDirectory(filePath(0))
    else
      ensureDirectory(filePath)
  }

  withBase(filePath: string) {
    return path.join(this.workDir, filePath)
  }
}
