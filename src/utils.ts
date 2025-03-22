import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function ensureDirectory(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })
}

export const execAsync = promisify(exec)
