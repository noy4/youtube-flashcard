export interface Options {
  input?: string | undefined
  subs1?: string | undefined
  subs2?: string | undefined
  fromLang: string
  toLang: string
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
