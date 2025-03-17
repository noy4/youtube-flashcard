# ドキュメンテーション

## アーキテクチャ

### コアモジュール

- `flashcard.ts`: メインの処理フロー
- `subtitle.ts`: 字幕の読み込みと解析
- `ai.ts`: OpenAI APIを使用した文字起こしと翻訳
- `anki.ts`: Ankiへのフラッシュカード追加
- `cli/index.ts`: CLIインターフェース

### 処理フロー

1. ビデオ/URLの入力
   - ローカルビデオファイル、またはYouTube URLからビデオをダウンロード
   - 出力ディレクトリに保存

2. 字幕の処理
   - 既存の字幕ファイルの読み込み、または
   - Whisper APIを使用した文字起こし
   - GPT-4を使用した翻訳

3. 音声セグメントの抽出
   - FFmpegを使用して字幕のタイミングに合わせて音声を抽出
   - セグメントごとにmp3ファイルを生成

4. Ankiへの出力
   - AnkiConnectを使用してフラッシュカードを追加
   - 音声ファイルの添付

## 依存ライブラリ

### OpenAI
- 用途：文字起こしと翻訳
- APIキー必須

### yt-dlp
- 用途：YouTubeビデオのダウンロード
- 代替：youtube-dl（メンテナンスの問題でyt-dlpを選択）

### FFmpeg
- 用途：音声セグメントの抽出
- 必須：システムにインストールが必要

### AnkiConnect
- 用途：Ankiとの連携
- 必須：Ankiのインストールと[AnkiConnectアドオン](https://ankiweb.net/shared/info/2055492159)

## ルール

- 簡素さを優先
- エラーハンドリングは最小限に
- 新機能追加時はREADMEとテストを更新

## 設定ファイル

設定は環境変数で管理：

```bash
# デフォルトのビデオ
VIDEO=path/to/video.mp4

# OpenAI APIキー
OPENAI_API_KEY=sk-...
```

## 出力ディレクトリ構造

```
output/
  ├── video.mp4          # 元のビデオ
  ├── subs1.srt          # 元の言語の字幕
  ├── subs2.srt          # 翻訳後の字幕
  └── segments/          # 音声セグメント
      ├── segment_0.mp3
      ├── segment_1.mp3
      └── ...
