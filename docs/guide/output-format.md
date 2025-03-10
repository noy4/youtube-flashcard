# 出力形式

このツールは、YouTube字幕をObsidian Spaced Repetition Plugin形式のフラッシュカードに変換します。

## Obsidian Spaced Repetition形式

[Obsidian Spaced Repetition Plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition)は、Obsidianでフラッシュカードを管理するためのプラグインです。

### 基本形式

```markdown
#flashcards

日本語での質問
日本語での質問の続き
?
English answer
More English answer

次の日本語の質問
?
Next English answer
```

### 出力例

```markdown
#flashcards

彼は毎朝6時に起きます
?
He wakes up at 6 o'clock every morning.

私は週末に友達と映画を見に行きました
?
I went to see a movie with my friends on the weekend.

この本は先週図書館で借りました
?
I borrowed this book from the library last week.
```

### 特徴

- ファイルの先頭に `#flashcards` タグを付与します
- 質問（日本語）と回答（英語）は `?` で区切られます
- 質問・回答ともに複数行にわたって記述できます
- 各カード間は空行で区切ります
- コードブロックや箇条書きなどのMarkdown記法が使用可能です

### 出力オプション

CLIでは以下のオプションを指定して出力形式をカスタマイズできます：

- `-l, --lang <language>`: 字幕の言語を指定（デフォルト: en）
- `--translate`: 日本語に翻訳するかどうか（OpenAI APIキーが必要）

### Obsidianでの表示

Obsidianで作成されたフラッシュカードは以下のように表示されます：

1. プレビューモードでは質問と回答が通常のテキストとして表示
2. Spaced Repetitionプラグインを使用すると、フラッシュカードとして学習可能
   - 質問のみが表示され、クリックして回答を確認
   - 学習状況に応じて復習間隔を自動調整

## その他の出力形式

現在は Obsidian Spaced Repetition形式のみをサポートしていますが、今後以下の形式への対応を検討しています：

- Anki互換形式
- CSV形式（汎用的なインポート用）
- Markdown（一般的なノート形式）