import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Translator } from '../src/translator.js'

// OpenAIのモック
vi.mock('openai', () => {
  const mockCreate = vi.fn()
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  }
})

describe('translator', () => {
  let translator: Translator
  let mockCreate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    translator = new Translator({
      apiKey: 'test-api-key',
      model: 'test-model',
    })
    const mockClient = (translator as any).client
    mockCreate = mockClient.chat.completions.create
  })

  describe('translate', () => {
    it('テキストを正常に翻訳できる', async () => {
      const mockSubtitles = [{
        text: 'Hello',
        start: 0,
        end: 1,
      }]

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify([{
              text: 'Hello',
              start: 0,
              end: 1,
              translation: '翻訳されたテキスト',
            }]),
          },
        }],
      })

      const result = await translator.translate(mockSubtitles, 'en', 'ja')

      expect(result[0].translation).toBe('翻訳されたテキスト')
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'test-model',
        messages: [
          {
            role: 'system',
            content: expect.any(String),
          },
          {
            role: 'user',
            content: expect.stringContaining('Hello'),
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })
    })

    it('aPIエラーの場合はエラーを投げる', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'))

      await expect(translator.translate([], 'en', 'ja'))
        .rejects
        .toThrow('翻訳中にエラーが発生しました')
    })

    it('空の応答の場合はエラーを投げる', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: '',
          },
        }],
      })

      await expect(translator.translate([], 'en', 'ja'))
        .rejects
        .toThrow('翻訳結果が空でした')
    })

    it('choices配列が空の場合はエラーを投げる', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [],
      })

      await expect(translator.translate([], 'en', 'ja'))
        .rejects
        .toThrow('翻訳結果が空でした')
    })
  })
})
