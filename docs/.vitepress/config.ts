import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'YouTube Flashcard',
  description: 'Generate flashcards from YouTube videos.',
  markdown: {
    breaks: true,
  },
  themeConfig: {
    outline: {
      level: [2, 3],
    },
    sidebar: [
      { text: 'Introduction', link: '/' },
      {
        text: 'Dev',
        items: [
          { text: 'TODO', link: '/dev/todo' },
          { text: 'ドキュメント', link: '/dev/docs' },
          { text: 'Dependencies', link: '/dev/dependencies' },
        ],
      },
    ],
  },
})
