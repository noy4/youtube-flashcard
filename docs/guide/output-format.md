# 出力形式

このツールは、YouTube字幕をObsidian Spaced Repetition Plugin形式のフラッシュカードに変換します。

## Obsidian Spaced Repetition形式

[Obsidian Spaced Repetition Plugin](https://github.com/st3v3nmw/obsidian-spaced-repetition)は、Obsidianでフラッシュカードを管理するためのプラグインです。

### 基本形式

```markdown
Question? #flashcard
Answer

Question2? #flashcard
Answer2
```

### 出力例

```markdown
What is TypeScript? #flashcard
TypeScript is a strongly typed programming language that builds on JavaScript.

How to declare a variable in TypeScript? #flashcard
You can declare a variable using 'let' or 'const' with an optional type annotation:
let name: string = "John";
const age: number = 30;
```

### 特徴

- 質問と回答は空行で区切られます
- 各質問の末尾に `#flashcard` タグが付与されます
- 回答は複数行にわたることができます
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