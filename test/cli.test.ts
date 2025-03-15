import type { Options } from '../src/flashcard.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// package.jsonのモック
vi.mock('../../package.json', () => ({
  default: {
    version: '1.0.0',
  },
}))

// モック関数
const mockCreateFlashcards = vi.fn()

// flashcard.jsのモック
vi.mock('../src/flashcard.js', () => ({
  createFlashcards: mockCreateFlashcards,
}))

describe('cli', () => {
  // CLIプログラムのインスタンス
  let cliProgram: any

  beforeEach(async () => {
    // 各テスト前にモジュールを再読み込み
    vi.resetModules()
    // CLIプログラムを再読み込み
    const module = await import('../src/cli/index.js')
    cliProgram = module.program

    // モックをリセット
    vi.clearAllMocks()
    // 環境変数をクリア
    delete process.env.VIDEO
    delete process.env.OPENAI_API_KEY
    delete process.env.OPENAI_BASE_URL
    delete process.env.AI_MODEL
  })

  afterEach(() => {
    // テスト後のクリーンアップ
    vi.resetModules()
  })

  it('デフォルト値でコマンドを実行', async () => {
    // コマンドを実行
    await cliProgram.parseAsync([
      'node',
      'test',
      'video.mp4',
      '--api-key',
      'dummy-key',
    ])

    // createFlashcardsが正しい引数で呼ばれたか確認
    expect(mockCreateFlashcards).toHaveBeenCalledWith({
      input: 'video.mp4',
      subs1: undefined,
      subs2: undefined,
      output: 'output/json.json',
      format: 'json',
      fromLang: 'en',
      toLang: 'ja',
      deckName: 'Default',
      modelName: '基本',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'google/gemini-flash-1.5-8b',
      apiKey: 'dummy-key',
    } satisfies Options)
  })

  it('すべてのオプションを指定してコマンドを実行', async () => {
    await cliProgram.parseAsync([
      'node',
      'test',
      'https://youtube.com/watch?v=123',
      'subs1.srt',
      'subs2.srt',
      '--output',
      'custom.json',
      '--format',
      'obsidian',
      '--from-lang',
      'ja',
      '--to-lang',
      'en',
      '--add-to-anki',
      '--deck-name',
      'MyDeck',
      '--model-name',
      'MyModel',
      '--api-key',
      'test-key',
      '--base-url',
      'https://api.test.com',
      '--model',
      'test-model',
    ])

    expect(mockCreateFlashcards).toHaveBeenCalledWith({
      input: 'https://youtube.com/watch?v=123',
      subs1: 'subs1.srt',
      subs2: 'subs2.srt',
      output: 'custom.json',
      format: 'obsidian',
      fromLang: 'ja',
      toLang: 'en',
      addToAnki: true,
      deckName: 'MyDeck',
      modelName: 'MyModel',
      apiKey: 'test-key',
      baseUrl: 'https://api.test.com',
      model: 'test-model',
    } satisfies Options)
  })

  it('環境変数から値を読み込み', async () => {
    // 環境変数を設定
    process.env.VIDEO = 'env-video.mp4'
    process.env.OPENAI_API_KEY = 'env-api-key'
    process.env.OPENAI_BASE_URL = 'https://env-api.test.com'
    process.env.AI_MODEL = 'env-model'

    // 新しいモジュールを読み込んで環境変数を反映
    vi.resetModules()
    const module = await import('../src/cli/index.js')
    cliProgram = module.program

    await cliProgram.parseAsync([
      'node',
      'test',
      '--api-key',
      process.env.OPENAI_API_KEY,
      '--base-url',
      process.env.OPENAI_BASE_URL,
      '--model',
      process.env.AI_MODEL,
    ])

    // createFlashcardsが正しい引数で呼ばれたか確認
    expect(mockCreateFlashcards).toHaveBeenCalledWith({
      input: 'env-video.mp4',
      subs1: undefined,
      subs2: undefined,
      output: 'output/json.json',
      format: 'json',
      fromLang: 'en',
      toLang: 'ja',
      deckName: 'Default',
      modelName: '基本',
      baseUrl: 'https://env-api.test.com',
      model: 'env-model',
      apiKey: 'env-api-key',
    } satisfies Options)
  })

  it('エラー時に終了コード1で終了', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // エラーを投げるようにモック
    mockCreateFlashcards.mockRejectedValueOnce(new Error('テストエラー'))

    await cliProgram.parseAsync([
      'node',
      'test',
      'video.mp4',
      '--api-key',
      'dummy-key',
    ])

    expect(mockConsoleError).toHaveBeenCalledWith('Error:', 'テストエラー')
    expect(mockExit).toHaveBeenCalledWith(1)

    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })

  it('必須オプションが指定されていない場合にエラー', async () => {
    // createFlashcardsがエラーを投げるようにモック
    mockCreateFlashcards.mockRejectedValueOnce(new Error('APIキーが必要です'))
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    await cliProgram.parseAsync([
      'node',
      'test',
      'video.mp4',
      '--add-to-anki',
    ])

    expect(mockConsoleError).toHaveBeenCalledWith('Error:', 'APIキーが必要です')
    expect(mockExit).toHaveBeenCalledWith(1)

    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })
})
