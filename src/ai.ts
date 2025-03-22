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
  async transcribe(params: {
    audioPath: string
    language: string
  }) {
    const { audioPath, language } = params
    const file = fs.createReadStream(audioPath)
    console.log('Transcribing audio...')

    const transcription = await this.client.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language,
      response_format: 'srt',
    })
    return transcription
  }

  /**
   * テキストを翻訳
   */
  async translate(params: {
    content: string
    fromLang: string
    toLang: string
  }) {
    const { content, fromLang, toLang } = params
    console.log('Translating text...')

    const systemPrompt = `You are a skilled translator from ${fromLang} to ${toLang}. Your task is to accurately translate each subtitle segment while preserving the timing information. Keep the SRT format intact. Do not add any extra information or comments, including code block.`

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
    })

    return response.choices[0].message.content || ''
  }
}
