import type { ChatCompletionMessageParam } from 'openai/resources'
import fs from 'node:fs'
import OpenAI from 'openai'

export class AIClient {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  /**
   * 音声ファイルから文字起こしを生成
   */
  async transcribe(audioFilePath: string, language: string) {
    const file = fs.createReadStream(audioFilePath)
    console.log('Transcribing audio...')

    try {
      const transcription = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file,
        language,
        response_format: 'srt',
      })
      return transcription
    }
    catch (error) {
      throw new Error(`文字起こしに失敗しました: ${(error as Error).message}`)
    }
  }

  /**
   * テキストを翻訳
   */
  async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    console.log('Translating text...')

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a skilled translator from ${fromLang} to ${toLang}. Your task is to accurately translate each subtitle segment while preserving the timing information. Keep the SRT format intact.`,
      },
      {
        role: 'user',
        content: text,
      },
    ]

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages,
      })

      const translation = response.choices[0].message.content
      if (!translation)
        throw new Error('翻訳結果が空です')

      return translation
    }
    catch (error) {
      throw new Error(`翻訳に失敗しました: ${(error as Error).message}`)
    }
  }
}
