import type { Options } from './types.js'
import { outputToAnki } from './anki.js'
import { Context } from './context.js'
import { loadSubtitles } from './subtitle.js'
import { loadAudio, loadVideo } from './video.js'

export async function createFlashcards(options: Options) {
  const context = new Context(options)

  await loadVideo(context)
  await loadAudio(context)
  await loadSubtitles(context)

  if (options.addToAnki)
    await outputToAnki(context)

  console.log('Done.')
}
