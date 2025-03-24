# YouTube Flashcard

A CLI tool to generate language learning flashcards from YouTube videos.

## Features

- Automatic transcription of YouTube video subtitles
- Automatic generation of translation from transcriptions
- Automatic extraction of audio segments
- Direct addition of flashcards to Anki

## Installation

```bash
npm install -g youtube-flashcard
```

## Usage

### Basic Usage

```bash
# Create flashcards by auto-generating subtitles from a YouTube video
youtube-flashcard https://www.youtube.com/watch?v=dKz095P7LdU

# Use existing subtitle files
youtube-flashcard video.mp4 subs1.srt subs2.srt
```

### Options

```bash
# Specify languages (default: en -> ja)
youtube-flashcard ... --from-lang en --to-lang ja

# Add flashcards directly to Anki
youtube-flashcard ... --add-to-anki --deck-name "English Study" --model-name "Basic"
```

### Environment Variables

You can set default values using the following environment variables:

- `VIDEO`: Default video path or URL
- `OPENAI_API_KEY`: OpenAI API key (required for transcription and translation)

## For Developers

### Development Environment

- TypeScript
- Node.js

### Required Tools

- OpenAI API: Used for transcription and translation
- FFmpeg: Used for audio segment extraction
- Anki: Required for adding flashcards (when using --add-to-anki option)

### Commands

```bash
npm install   # Setup
npm test      # Run tests
```

## License

MIT
