import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Mustache from 'mustache'

export class Prompt {
  constructor(public markdown: string) {}

  static load(name: string) {
    const path = join(import.meta.dirname, 'prompts', `${name}.md`)
    const markdown = readFileSync(path, 'utf-8')
    return new Prompt(markdown)
  }

  /**
   * markdownをパースしてメッセージに変換
   */
  parse(content: string) {
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
   * テンプレートをパースしてメッセージに変換
   */
  toMessages(variables: Record<string, unknown> = {}) {
    const rendered = Mustache.render(this.markdown, variables)
    return this.parse(rendered)
  }
}
