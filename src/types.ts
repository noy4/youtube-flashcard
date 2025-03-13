export type OutputFormat = 'obsidian' | 'anki' | 'json'

export interface Flashcard {
  front: string
  back: string
  videoId?: string
  start: number
  end: number
}
