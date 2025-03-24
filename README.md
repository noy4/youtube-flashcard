# YouTube Flashcard

Generate flashcards from YouTube videos.

```bash
youtube-flashcard <youtube-url> --openai-api-key <your_openai_api_key>
```

<img src='public/front.png' width='400' />
<img src='public/back.png' width='400' />

## Features

- Automatic transcription of YouTube video subtitles (with OpenAI Whisper)
- Automatic generation of translation from transcriptions
- Automatic extraction of audio segments
- Direct addition of flashcards to Anki

## Installation

```bash
npm install -g youtube-flashcard
```

## Usage

```bash
# Create flashcards by auto-generating subtitles from a YouTube video
youtube-flashcard https://www.youtube.com/watch?v=dKz095P7LdU

# With custom subtitle files
youtube-flashcard https://www.youtube.com/watch?v=dKz095P7LdU subs1.srt subs2.srt

# With your own video file
youtube-flashcard path/to/video.mp4

# Specify languages (default: en -> ja)
youtube-flashcard ... --from-lang en --to-lang ja
```

## License

MIT
