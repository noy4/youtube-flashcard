import type { Context } from './context.js'
import * as fs from 'node:fs'
import { parseSync } from 'subtitle'

/**
 * Load subtitles from files or generate them using AI.
 */
export async function loadSubtitles(context: Context) {
  const { options, pathManager } = context
  const { paths } = pathManager

  const subs1Content = await loadSubtitle({
    input: options.subs1,
    output: paths.subs1,
    // transcribe
    generate: () => context.ai.transcribe(paths.audio),
  })

  const subs2Content = await loadSubtitle({
    input: options.subs2,
    output: paths.subs2,
    // translate
    generate: () => context.ai.translate(subs1Content),
  })

  const subs1 = parseSubs(subs1Content)
  const subs2 = parseSubs(subs2Content)

  if (subs1.length !== subs2.length)
    throw new Error(`The number of subtitles does not match. (${subs1.length}-${subs2.length})`)

  const subtitles = subs1.map((sub, index) => ({
    ...sub,
    translation: subs2[index].text,
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
