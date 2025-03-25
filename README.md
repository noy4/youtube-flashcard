# YouTube Flashcard

Generate flashcards from YouTube videos.

```bash
npm run start <youtube-url>
```

<img src='public/front.png' width='400' /> <img src='public/back.png' width='400' />

## Features

- Automatic **transcription** of YouTube video subtitles (with OpenAI Whisper)
- Automatic generation of **translation from transcriptions**
- Automatic extraction of audio segments
- Direct addition of flashcards to **Anki**

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

## Advanced

Translate with different models:

```.env
TRANSLATOR_BASE_URL=https://openrouter.ai/api/v1
TRANSLATOR_API_KEY=sk-or-v1-b50b...
TRANSLATOR_MODEL=anthropic/claude-3.7-sonnet:beta # default: gpt-4o
```

## Related Projects

[youtube anki](https://github.com/search?q=youtube%20anki&type=repositories) (github search):

- [dobladov/youtube2Anki](https://github.com/dobladov/youtube2Anki)
- [hugepizza/youtube2anki](https://github.com/hugepizza/youtube2anki)
- [kamui-fin/yt-to-anki](https://github.com/kamui-fin/yt-to-anki)
- [katspaugh/youtube-flashcards](https://github.com/katspaugh/youtube-flashcards)

[subs2srs](https://subs2srs.sourceforge.net/) - GUI software for Windows

[subs2srs](https://github.com/topics/subs2srs) (GitHub Topics):
- [langkit](https://github.com/tassa-yoniso-manasi-karoto/langkit)
  - [bunkai](https://github.com/ustuehler/bunkai)
  - [substudy](https://github.com/emk/subtitles-rs/tree/master/substudy)
  - [movies2anki](https://github.com/kelciour/movies2anki)

## License

MIT
