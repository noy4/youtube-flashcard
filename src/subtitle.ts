import type { Context, Subtitle } from './types.js'
import * as fs from 'node:fs'
import path from 'node:path'
import { parseSync } from 'subtitle'

function parseSubs(content: string) {
  return parseSync(content)
    .filter(node => node.type === 'cue')
    .map(v => v.data)
}

async function loadSubtitle(params: {
  input?: string
  output: string
  generate: () => Promise<string>
}) {
  const { input, output, generate } = params

  if (input) {
    if (!fs.existsSync(input))
      throw new Error(`${input} not found`)

    return fs.readFileSync(input, 'utf-8')
  }
  else {
    const content = await generate()
    fs.writeFileSync(output, content)
    return content
  }
}

// 文字起こしの読み込み
export async function loadSubtitles(context: Context) {
  const { options, paths } = context

  const subs1Content = await loadSubtitle({
    input: options.subs1,
    output: paths.subs1,
    generate: async () => {
      const transcription = await context.ai.transcribe({
        audioPath: paths.video,
        language: options.fromLang,
      })
      return transcription
    },
  })

  const subs2Content = await loadSubtitle({
    input: options.subs2,
    output: paths.subs2,
    generate: async () => {
      const translation = await context.ai.translate({
        content: subs1Content,
        fromLang: options.fromLang,
        toLang: options.toLang,
      })
      return translation
    },
  })

  const subs1 = parseSubs(subs1Content)
  const subs2 = parseSubs(subs2Content)

  const subtitles: Subtitle[] = []
  for (const [index, sub] of subs1.entries()) {
    subtitles.push({
      ...sub,
      translation: subs2[index].text,
      audioPath: path.join(paths.segments, `segment_${index}.mp3`),
    })
  }
  context.subtitles = subtitles
}
