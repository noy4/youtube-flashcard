import type { Flashcard } from '../src/types.js'
import type { Subtitle } from '../src/youtube.js'
import OpenAI from 'openai'
import { describe, expect, it, vi } from 'vitest'
import { Prompt } from '../src/prompt/index.js'
import { SubtitleProcessor } from '../src/subtitle-processor.js'

// OpenAIのモック
vi.mock('openai', () => {
  const mockCreate = vi.fn()
  const MockOpenAI = vi.fn(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }))
  return { default: MockOpenAI }
})

// Promptのモック
vi.mock('../src/prompt/index.js', () => ({
  Prompt: {
    load: vi.fn().mockReturnValue({
      toMessages: vi.fn().mockReturnValue([
        { role: 'user', content: 'test' },
      ]),
    }),
  },
}))

describe('subtitle processor', () => {
  const mockOptions = {
    apiKey: 'test-key',
    model: 'gpt-3.5-turbo',
  }

  const mockVideoId = 'test-video-id'

  const mockSubtitles: Subtitle[] = [
    {
      text: 'Hello world',
      start: 0,
      end: 3,
    },
  ]

  const mockTranslatedSubtitles: Subtitle[] = [
    {
      text: 'Hello world',
      translation: 'こんにちは世界',
      start: 0,
      end: 3,
    },
  ]

  const expectedFlashcards: Flashcard[] = [
    {
      front: 'こんにちは世界',
      back: 'Hello world',
      videoId: mockVideoId,
      start: 0,
      end: 3,
    },
  ]

  it('should create an instance with correct options', () => {
    const processor = new SubtitleProcessor(mockOptions, mockVideoId)
    expect(processor).toBeInstanceOf(SubtitleProcessor)
  })

  it('should convert subtitles to flashcards', async () => {
    const processor = new SubtitleProcessor(mockOptions, mockVideoId)
    const mockOpenAI = vi.mocked(OpenAI).mock.results[0].value

    // モックの応答を設定
    mockOpenAI.chat.completions.create
      // formatter の応答
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSubtitles),
            },
          },
        ],
      })
      // translator の応答
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockTranslatedSubtitles),
            },
          },
        ],
      })

    const flashcards = await processor.convert(mockSubtitles)

    // APIの呼び出し回数を検証
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2)
    // formatter と translator のプロンプトが読み込まれたことを確認
    expect(Prompt.load).toHaveBeenCalledWith('formatter')
    expect(Prompt.load).toHaveBeenCalledWith('translator')
    // 最終的な出力を検証
    expect(flashcards).toEqual(expectedFlashcards)
  })

  it('should handle empty response from OpenAI', async () => {
    const processor = new SubtitleProcessor(mockOptions, mockVideoId)
    const mockOpenAI = vi.mocked(OpenAI).mock.results[0].value

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: '[]',
          },
        },
      ],
    })

    const flashcards = await processor.convert(mockSubtitles)
    expect(flashcards).toEqual([])
  })

  it('should handle invalid JSON response from OpenAI', async () => {
    const processor = new SubtitleProcessor(mockOptions, mockVideoId)
    const mockOpenAI = vi.mocked(OpenAI).mock.results[0].value

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'invalid json',
          },
        },
      ],
    })

    await expect(processor.convert(mockSubtitles)).rejects.toThrow()
  })

  it('should use correct language parameters', async () => {
    const processor = new SubtitleProcessor(mockOptions, mockVideoId)
    const mockOpenAI = vi.mocked(OpenAI).mock.results[0].value

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: '[]' } }],
    })

    await processor.convert(mockSubtitles, 'fr', 'es')

    // translator呼び出し時のパラメータを検証
    expect(Prompt.load).toHaveBeenLastCalledWith('translator')
    expect(Prompt.load('translator').toMessages).toHaveBeenLastCalledWith({
      subtitles: [],
      fromLang: 'fr',
      toLang: 'es',
    })
  })
})
