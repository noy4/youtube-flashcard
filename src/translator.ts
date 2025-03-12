import { writeFileSync } from 'fs';
import OpenAI from 'openai';
import type { Subtitle } from './youtube.js';

export class Translator {
  private client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter APIキーが必要です');
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });
  }

  /**
   * 複数の字幕を一括で翻訳
   * @param subtitles 翻訳する字幕の配列
   * @param fromLang 元の言語（例: 'en'）
   * @param toLang 翻訳後の言語（例: 'ja'）
   * @returns 翻訳済みの字幕配列
   */
  async translate(
    subtitles: Subtitle[],
    fromLang: string,
    toLang: string
  ): Promise<Subtitle[]> {
    const systemPrompt = 'You are a professional subtitle translator. Ensure proper English punctuation before translation for maximum accuracy and clarity. Return results in the specified JSON format.'

    const userPrompt = `Add appropriate punctuation to the English text in these subtitles:
- Use commas (,) for clauses and lists
- Use periods (.) for complete sentences

Then translate from ${fromLang} to ${toLang} and add as 'translation' field.

${JSON.stringify(subtitles, null, 2)}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('翻訳結果が空でした');
      }

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('翻訳結果が空でした');
      }

      let translatedSubtitles: Subtitle[];
      try {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          throw new Error('翻訳結果が配列ではありません');
        }
        translatedSubtitles = parsed;
      } catch (error) {
        throw new Error('翻訳結果のJSONパースに失敗しました');
      }

      writeFileSync('translations.json', JSON.stringify(translatedSubtitles, null, 2), 'utf8');

      if (translatedSubtitles.length !== subtitles.length) {
        throw new Error('翻訳結果の数が入力字幕の数と一致しません');
      }

      return translatedSubtitles;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('翻訳中にエラーが発生しました');
    }
  }
}