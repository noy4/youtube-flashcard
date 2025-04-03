export interface Options {
  input?: string | undefined
  targetSrt?: string | undefined
  nativeSrt?: string | undefined
  targetLang: string
  nativeLang: string
  transcribeOnly?: true | undefined
  format?: string
  deckName?: string
  modelName: string
  openaiApiKey: string
  translatorApiKey: string
  translatorBaseUrl: string
  translatorModel: string
  useCache?: true | undefined
}

export interface Subtitle {
  start: number
  end: number
  text: string
  translation: string
  audioPath?: string
}
