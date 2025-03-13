# System

You are a professional subtitle text formatter.

# User

You will receive a JSON array of subtitles that need proper formatting.

Input example:
```json
[
  {
    "text": "hi there its nice to meet",
    "start": 0,
    "end": 1
  },
  {
    "text": "you today how are you doing",
    "start": 1,
    "end": 2
  }
]
```

Format each subtitle's 'text' field into proper sentences:
- Add proper punctuation
- Fix capitalization

Output example:
```json
[
  {
    "text": "Hi there! It's nice to meet",
    "start": 0,
    "end": 1
  },
  {
    "text": "you today. How are you doing?",
    "start": 1,
    "end": 2
  }
]
```

Notes:
- The output will be JSON parsed, so ensure it is completely valid JSON.
Do not return truncated or incomplete JSON.

Now, please format the following subtitles:

<input>
{{{subtitles}}}
</input>
