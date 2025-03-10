import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Flashcard Converter",
  description: "YouTube字幕からフラッシュカードを生成",
  themeConfig: {
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
          { text: 'ブラウザ拡張', link: '/guide/browser-extension' }
        ]
      },
      {
        text: '開発',
        items: [
          { text: 'TODO', link: '/todo' },
          { text: '依存ライブラリ', link: '/guide/dependencies' }
        ]
      }
    ]
  }
})