import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Flashcard Converter',
  description: 'YouTube字幕からフラッシュカードを生成',
  markdown: {
    breaks: true,
  },
  themeConfig: {
    outline: {
      level: [2, 3],
    },
    sidebar: [
      { text: 'Introduction', link: '/' },
      { text: 'Output format', link: '/guide/output-format' },
      {
        text: '開発',
        items: [
          { text: 'TODO', link: '/dev/todo' },
          { text: 'ドキュメント', link: '/dev/docs' },
          { text: 'Dependencies', link: '/dev/dependencies' },
        ],
      },
    ],
  },
})
