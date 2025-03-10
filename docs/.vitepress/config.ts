import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Flashcard Converter",
  description: "YouTube字幕からフラッシュカードを生成",
  themeConfig: {
    outline: {
      level: [2, 3]
    },
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'ガイド', link: '/guide/' }
    ],
    sidebar: [
      {
        text: 'ガイド',
        items: [
          { text: '使い方', link: '/guide/' },
          { text: 'CLI', link: '/guide/cli' },
          { text: 'ブラウザ拡張', link: '/guide/browser-extension' },
          { text: '出力形式', link: '/guide/output-format' }
        ]
      },
      {
        text: '開発',
        items: [
          { text: 'TODO', link: '/todo' },
          { text: '依存ライブラリ', link: '/guide/dependencies' },
          { text: 'YouTube字幕ライブラリ比較', link: '/guide/youtube-libraries-comparison' }
        ]
      }
    ]
  }
})