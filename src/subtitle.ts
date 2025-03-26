import type { Context } from './context.js'
import * as fs from 'node:fs'
import { parseSync } from 'subtitle'

/**
 * Load subtitles from files or generate them using AI.
 */
export async function loadSubtitles(context: Context) {
  const { options, pathManager } = context
  const { paths } = pathManager

  const targetSrtContent = await loadSubtitle({
    input: options.targetSrt,
    output: paths.targetSrt,
    // transcribe
    generate: () => context.ai.transcribe(paths.audio),
  })

  const nativeSrtContent = await loadSubtitle({
    input: options.nativeSrt,
    output: paths.nativeSrt,
    // translate
    generate: () => context.ai.translate(targetSrtContent),
  })

  const targetSrt = parseSubs(targetSrtContent)
  const nativeSrt = parseSubs(nativeSrtContent)

  if (targetSrt.length !== nativeSrt.length)
    throw new Error(`The number of subtitles does not match. (${targetSrt.length}-${nativeSrt.length})`)

  const subtitles = targetSrt.map((sub, index) => ({
    ...sub,
    translation: nativeSrt[index].text,
    audioPath: paths.segments(index),
  }))

  context.subtitles = subtitles
}

async function loadSubtitle(params: {
  input?: string
  output: string
  generate: () => Promise<string>
}) {
  const { input, output, generate } = params
  let content: string

  if (input)
    content = fs.readFileSync(input, 'utf-8')
  else
    content = await generate()

  fs.writeFileSync(output, content)
  return content
}

function parseSubs(content: string) {
  return parseSync(content)
    .filter(node => node.type === 'cue')
    .map(v => v.data)
}
