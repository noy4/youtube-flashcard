import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * プロンプトファイルを読み込む
 * @param category プロンプトのカテゴリ（例: 'translator'）
 * @param filename ファイル名（例: 'system.md'）
 * @returns プロンプトの内容
 */
export function readPrompt(category: string, filename: string): string {
  const path = join(import.meta.dirname, category, filename)
  return readFileSync(path, 'utf-8')
}
