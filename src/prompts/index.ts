import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * プロンプトセクションのマッピング
 */
interface PromptSections {
  'System Prompt': string
  'User Prompt': string
}

/**
 * プロンプトセクションを解析
 * @param content Markdownの内容
 * @returns セクション名とその内容のマップ
 */
function parsePrompt(content: string): PromptSections {
  const sections = {
    'System Prompt': '',
    'User Prompt': '',
  } as PromptSections

  const matches = content.matchAll(/^# (.+)\n([\s\S]+?)(?=\n# |$)/g)

  for (const match of matches) {
    const [, title, content] = match
    const sectionTitle = title.trim()
    if (sectionTitle === 'System Prompt' || sectionTitle === 'User Prompt') {
      sections[sectionTitle] = content.trim()
    }
  }

  return sections
}

/**
 * プロンプトファイルを読み込んで解析
 * @param category プロンプトのカテゴリ（例: 'translator'）
 * @returns セクション名とその内容のマップ
 */
export function loadPrompt(category: string): PromptSections {
  const path = join(import.meta.dirname, category, 'prompt.md')
  const content = readFileSync(path, 'utf-8')
  return parsePrompt(content)
}
