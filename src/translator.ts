import OpenAI from 'openai';

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
   * 複数のテキストを一括で翻訳
   * @param texts 翻訳するテキストの配列
   * @param fromLang 元の言語（例: 'en'）
   * @param toLang 翻訳後の言語（例: 'ja'）
   * @returns 翻訳されたテキストの配列
   */
  async translateBatch(texts: string[], fromLang: string, toLang: string): Promise<string[]> {
    const prompt = `Translate the following texts from ${fromLang} to ${toLang}.
For each text, only return the translation without any additional text.
Return all translations as a JSON array of strings.

${JSON.stringify(texts, null, 2)}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate texts accurately while maintaining natural language flow. Return the translations as a JSON array.'
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

      let translations: string[];
      try {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          throw new Error('翻訳結果が配列ではありません');
        }
        translations = parsed;
      } catch (error) {
        throw new Error('翻訳結果のJSONパースに失敗しました');
      }

      if (translations.length !== texts.length) {
        throw new Error('翻訳結果の数が入力テキストの数と一致しません');
      }

      return translations;
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
        temperature: 0.3, // より正確な翻訳のために低めの値を設定
      });

      // 空の応答のチェック
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
      // その他のエラーは全て統一的なメッセージで処理
      throw new Error('翻訳中にエラーが発生しました');
    }
  }
}