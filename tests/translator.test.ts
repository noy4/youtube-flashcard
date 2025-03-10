import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Translator } from '../src/translator.js';

// OpenAIのモック
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

describe('Translator', () => {
  let translator: Translator;
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    translator = new Translator('test-api-key');
    const mockClient = (translator as any).client;
    mockCreate = mockClient.chat.completions.create;
  });

  it('APIキーなしでインスタンス化するとエラーを投げる', () => {
    expect(() => new Translator('')).toThrow('OpenAI APIキーが必要です');
  });

  describe('translate', () => {
    it('テキストを正常に翻訳できる', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: '翻訳されたテキスト'
          }
        }]
      });

      const result = await translator.translate('Hello', 'en', 'ja');

      expect(result).toBe('翻訳されたテキスト');
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: expect.any(String)
          },
          {
            role: 'user',
            content: expect.stringContaining('Hello')
          }
        ],
        temperature: 0.3
      });
    });

    it('APIエラーの場合はエラーを投げる', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      await expect(translator.translate('Hello', 'en', 'ja'))
        .rejects
        .toThrow('翻訳中にエラーが発生しました');
    });

    it('空の応答の場合はエラーを投げる', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: ''
          }
        }]
      });

      await expect(translator.translate('Hello', 'en', 'ja'))
        .rejects
        .toThrow('翻訳結果が空でした');
    });

    it('choices配列が空の場合はエラーを投げる', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: []
      });

      await expect(translator.translate('Hello', 'en', 'ja'))
        .rejects
        .toThrow('翻訳結果が空でした');
    });
  });
});