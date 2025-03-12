# 出力形式

- [Anki](https://apps.ankiweb.net/) 形式
- [Obsidian Spaced Repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition) 形式

## Anki 形式

```html
{{text}}
<br>

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/{{id}}?start={{startSeconds}}&end={{endSeconds}}&autoplay=1"
  frameborder="0"
  autoplay="1"
/>
```

## Obsidian Spaced Repetition 形式

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

## JSON 形式

```json
[
  {
    "front": "彼は毎朝6時に起きます",
    "back": "He wakes up at 6 o'clock every morning.",
    "videoId": "abc123",
    "startTime": 0,
    "endTime": 10
  },
  {
    "front": "私は週末に友達と映画を見に行きました",
    "back": "I went to see a movie with my friends on the weekend."
  }
]
```

ビデオIDと時間情報は、YouTube動画から作成されたフラッシュカードの場合のみ含まれます。
