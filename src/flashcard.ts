import type { Options } from './types.js'
import { outputToAnki } from './anki.js'
import { createContext } from './context.js'
import { loadSubtitles } from './subtitle.js'
import { loadAudio, loadVideo } from './video.js'

export async function createFlashcards(options: Options) {
  const context = createContext(options)
  const { pathManager } = context
  const { paths } = pathManager

  if (options.useCache) {
    console.log('Using cached files...')
    context.options.input ||= paths.video
    context.options.targetSrt ||= paths.targetSrt
    context.options.nativeSrt ||= paths.nativeSrt
  }
  else {
    pathManager.init()
  }

  await loadVideo(context)
  await loadAudio(context)
  await loadSubtitles(context)

  if (options.addToAnki)
    await outputToAnki(context)
}
