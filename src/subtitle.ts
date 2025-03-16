import type { Context } from './types.js'
import * as fs from 'node:fs'
import path from 'node:path'
import { parseSync } from 'subtitle'

/**
 * Load subtitles from files or generate them using AI.
 */
export async function loadSubtitles(context: Context) {
  const { options, paths } = context

  const subs1Content = await loadSubtitle({
    input: options.subs1,
    output: paths.subs1,
    // transcribe
    generate: () => context.ai.transcribe({
      audioPath: paths.video,
      language: options.fromLang,
    }),
  })

  const subs2Content = await loadSubtitle({
    input: options.subs2,
    output: paths.subs2,
    // translate
    generate: () => context.ai.translate({
      content: subs1Content,
      fromLang: options.fromLang,
      toLang: options.toLang,
    }),
  })

  const subs1 = parseSubs(subs1Content)
  const subs2 = parseSubs(subs2Content)

  const subtitles = subs1.map((sub, index) => ({
    ...sub,
    translation: subs2[index].text,
    audioPath: path.join(paths.segments, `segment_${index}.mp3`),
  }))

  context.subtitles = subtitles
}

async function loadSubtitle(params: {
  input?: string
  output: string
  generate: () => Promise<string>
}) {
  const { input, output, generate } = params

  if (input) {
    return fs.readFileSync(input, 'utf-8')
  }
  else {
    const content = await generate()
    fs.writeFileSync(output, content)
    return content
  }
}

function parseSubs(content: string) {
  return parseSync(content)
    .filter(node => node.type === 'cue')
    .map(v => v.data)
}
