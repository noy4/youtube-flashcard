import type { Options } from './types.js'
import { outputToAnki } from './anki.js'
import { Context } from './context.js'
import { loadNativeSrt, loadTargetSrt } from './subtitle.js'
import { loadAudio, loadVideo } from './video.js'

export async function createFlashcards(options: Options) {
  const context = new Context(options)

  await loadVideo(context)
  await loadAudio(context)
  await loadTargetSrt(context)

  if (!options.transcribeOnly) {
    await loadNativeSrt(context)

    if (options.format === 'anki')
      await outputToAnki(context)
  }

  console.log('Done.')
}
