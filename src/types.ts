export interface Options {
  input?: string | undefined
  targetSrt?: string | undefined
  nativeSrt?: string | undefined
  targetLang: string
  nativeLang: string
  addToAnki?: true | undefined
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
