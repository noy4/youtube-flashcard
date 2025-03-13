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
    const matches = content.matchAll(/^# (.+)\n([\s\S]+?)(?=\n# |$)/g)

    for (const match of matches) {
      const [, role, content] = match
      messages.push({ role, content: content.trim() } as ChatCompletionMessageParam)
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
