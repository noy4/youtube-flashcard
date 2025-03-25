# YouTube Flashcard

Generate flashcards from YouTube videos.

```bash
npm run start <youtube-url>
```

<img src='public/front.png' width='400' /> <img src='public/back.png' width='400' />

## Features

- Automatic transcription of YouTube video subtitles (with OpenAI Whisper)
- Automatic generation of translation from transcriptions
- Automatic extraction of audio segments
- Direct addition of flashcards to Anki

## Installation & Setup

```bash
git clone https://github.com/noy4/youtube-flashcard.git
cd youtube-flashcard
npm install
```

Add `.env`:

```bash
OPENAI_API_KEY=your_openai_api_key
```

## Usage

```bash
# Create flashcards by auto-generating subtitles from a YouTube video
npm run start https://www.youtube.com/watch?v=dKz095P7LdU

# With custom subtitle files
npm run start https://www.youtube.com/watch?v=dKz095P7LdU subs1.srt subs2.srt

# With your own video file
npm run start path/to/video.mp4

# Specify languages (default: en -> ja)
npm run start ... --from-lang en --to-lang ja
```

## License

MIT
