import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Mustache from 'mustache'

export class Prompt {
  markdown: string
  messages: ChatCompletionMessageParam[] = []

  constructor(name: string) {
    this.markdown = this.load(name)
  }

  /**
   * プロンプトファイルを読み込んで解析
   */
  private load(name: string) {
    const path = join(import.meta.dirname, 'prompts', `${name}.md`)
    return readFileSync(path, 'utf-8')
  }

  /**
   * プロンプトセクションを解析
   */
  private parse(content: string) {
    const messages: ChatCompletionMessageParam[] = []
    const chunks = content.split(/^# (\w+)\n/gm)
    const first = chunks.shift()

    if (first) {
      messages.push({
        role: 'user',
        content: first.trim(),
      })
    }

    for (let i = 0; i < chunks.length; i += 2) {
      messages.push({
        role: chunks[i].toLowerCase() as any,
        content: chunks[i + 1].trim(),
      })
    }

    return messages
  }

  /**
   * OpenAI APIのメッセージ形式に変換
   */
  toMessages(variables: Record<string, unknown> = {}) {
    const rendered = Mustache.render(this.markdown, variables)
    return this.parse(rendered)
  }
}
