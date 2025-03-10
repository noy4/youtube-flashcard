# TODO

## 進行中
- [/] CLIの実装
  - [x] YouTubeの字幕取得機能（英語のみ対応）
  - [x] フラッシュカード形式への変換機能
    - [x] 基本的な変換機能
    - [x] Obsidian Spaced Repetition形式での出力
    - [x] OpenAI APIを使用した翻訳機能
  - [ ] 多言語対応の実装
    - [ ] 日本語字幕対応
    - [ ] その他の言語対応
- [ ] ドキュメント作成
  - [ ] CLIの使用方法
    - [ ] インストール手順
    - [ ] OpenAI APIキーの設定方法
    - [ ] コマンドオプションの説明
  - [ ] 技術仕様

## 計画中
- [ ] ブラウザ拡張機能の開発
  - [ ] YouTubeページでの実行ボタン設置
  - [ ] 字幕取得とフラッシュカード変換機能の実装
  - [ ] 出力機能

## 技術的な課題
- [ ] テスト環境の構築
  - [ ] Jest/Vitest等のテストフレームワーク導入
  - [ ] ユニットテストの作成
    - [ ] youtube.tsのテスト
    - [ ] converter.tsのテスト（翻訳機能含む）
    - [ ] translator.tsのテスト
    - [ ] CLI機能のテスト
  - [ ] E2Eテストの検討
- [ ] 依存ライブラリのドキュメント整備
  - [ ] youtube-caption-extractorの使用例
  - [ ] commanderの使用例
  - [ ] openaiの使用例と設定方法
  - [ ] 参考プロジェクトのリスト作成

## 完了
- [x] プロジェクト初期化
- [x] TypeScript環境構築
- [x] VitePressドキュメント環境構築
- [x] CLIの基本構造実装
- [x] YouTubeの字幕取得機能（英語）
- [x] Obsidian Spaced Repetition形式での出力
- [x] 翻訳機能の実装（OpenAI API）
- [x] 言語指定オプションの追加

## メモ
- Obsidian Spaced Repetition Pluginの仕様は実装済み（#flashcard形式）
- ブラウザ拡張は第2フェーズとして実装予定
- 多言語対応は翻訳機能実装後に着手
- OpenAI APIの使用料金に注意（必要に応じてトークン数の制限を検討）