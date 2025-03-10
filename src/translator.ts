import OpenAI from 'openai';

export class Translator {
  private client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI APIキーが必要です');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * テキストを翻訳
   * @param text 翻訳するテキスト
   * @param fromLang 元の言語（例: 'en'）
   * @param toLang 翻訳後の言語（例: 'ja'）
   */
  async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    const prompt = `Translate the following text from ${fromLang} to ${toLang}. Only return the translation without any additional text:\n\n${text}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
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

      const translation = response.choices[0]?.message?.content?.trim();
      if (!translation) {
        throw new Error('翻訳結果が空でした');
      }

      return translation;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`翻訳中にエラーが発生しました: ${error.message}`);
      }
      throw error;
    }
  }
}