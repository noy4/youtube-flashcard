import type { Options } from './types.js'
import fs from 'node:fs'
import OpenAI from 'openai'

export class AIClient {
  constructor(public options: Options) {}

  /**
   * Transcribe audio to text using OpenAI Whisper
   */
  async transcribe(audioPath: string) {
    const { openaiApiKey, targetLang } = this.options

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })
    const file = fs.createReadStream(audioPath)
    console.log('Transcribing audio with Whisper...')

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language: targetLang,
      response_format: 'srt',
    })
    return transcription
  }

  /**
   * Translate
   */
  async translate(content: string) {
    const {
      targetLang,
      nativeLang,
      openaiApiKey,
      translatorApiKey,
      translatorBaseUrl,
      translatorModel,
    } = this.options
    const openai = new OpenAI({
      apiKey: translatorApiKey || openaiApiKey,
      baseURL: translatorBaseUrl,
    })
    console.log(`Translating text with '${translatorModel}'...`)

    const systemPrompt = `You are a skilled translator from ${targetLang} to ${nativeLang}. Your task is to accurately translate each subtitle segment while preserving the timing information. Keep the SRT format intact. Do not add any extra information or comments, including code block.`

    console.time('Translation')
    const response = await openai.chat.completions.create({
      model: translatorModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ],
    })
    console.timeEnd('Translation')

    return response.choices[0].message.content || ''
  }
}
