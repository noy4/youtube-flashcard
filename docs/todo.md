# TODO

## 進行中
- [/] OpenRouter対応
  - [x] OpenAI SDKのbaseURLをOpenRouterに変更
  - [ ] OpenAPI APIキー設定方法のドキュメント更新
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
- [/] テスト環境の構築
  - [x] Vitestの導入と設定
  - [/] ユニットテストの作成
    - [x] youtube.tsのテスト (カバレッジ93.93%)
    - [x] converter.tsのテスト (カバレッジ94.28%)
    - [x] translator.tsのテスト (カバレッジ100%)
    - [ ] CLI機能のテスト（カバレッジ0%）
  - [ ] E2Eテストの検討
- [ ] テストカバレッジ改善タスク
  - [ ] converter.tsの分岐カバレッジ改善（現在83.33%）
  - [ ] youtube.tsの未カバー部分の改善
  - [ ] CLIモジュールのテスト実装
- [x] 依存ライブラリのドキュメント整備
  - [x] youtube-caption-extractorの使用例
  - [x] commanderの使用例
  - [x] openaiの使用例と設定方法
  - [x] 参考プロジェクトのリスト作成

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
- テストカバレッジは主要モジュールで90%以上を達成