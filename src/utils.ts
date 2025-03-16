import fs from 'node:fs'
import path from 'node:path'

export function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })
}
