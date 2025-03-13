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
Your response will be directly parsed as JSON array, so:
- DO NOT include any additional text like "Here is the processed subtitles:".
- DO NOT include "```json" code block.
- DO NOT return truncated or incomplete JSON array.

Now, please process the following subtitles:

<input>
{{{subtitles}}}
</input>
