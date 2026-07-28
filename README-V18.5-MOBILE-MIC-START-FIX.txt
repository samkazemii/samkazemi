V18.5 — Mobile Microphone Start Fix

Only the Voice AI startup flow was changed.

- SpeechRecognition.start() now runs synchronously inside the Voice button tap.
- Fixes Safari and iOS Chrome taking microphone permission but never entering Listening mode.
- The Voice button activates immediately, then switches to Listening when onstart fires.
- Persian recognition remains fixed to fa-IR.
- Desktop behavior, Community Hub, Realtime, admin tools, AI replies, piano/audio, CSS, database schema, and all other files are unchanged.
