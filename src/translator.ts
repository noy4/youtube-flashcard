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
  async translateBatch(subtitles: Subtitle[], fromLang: string, toLang: string): Promise<Subtitle[]> {
    const prompt = `Translate the text field from ${fromLang} to ${toLang} for each subtitle in the following JSON array.
Add a 'translation' field to each subtitle object with the translated text.
Return the entire JSON array with the added translations.

${JSON.stringify(subtitles, null, 2)}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate text accurately while maintaining natural language flow. Return the translations as a JSON array with translation field added to each subtitle object.'
          },
          {
            role: 'user',
            content: prompt
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

  /**
   * 単一のテキストを翻訳
   * @param text 翻訳するテキスト
   * @param fromLang 元の言語（例: 'en'）
   * @param toLang 翻訳後の言語（例: 'ja'）
   */
  async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    const prompt = `Translate the following text from ${fromLang} to ${toLang}. Only return the translation without any additional text:\n\n${text}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate text accurately while maintaining natural language flow.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('翻訳結果が空でした');
      }

      const translation = response.choices[0]?.message?.content?.trim();
      if (!translation) {
        throw new Error('翻訳結果が空でした');
      }

      return translation;
    } catch (error) {
      if (error instanceof Error && error.message === '翻訳結果が空でした') {
        throw error;
      }
      throw new Error('翻訳中にエラーが発生しました');
    }
  }
}