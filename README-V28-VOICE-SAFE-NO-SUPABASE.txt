SAM KAZEMI PORTFOLIO — V28 VOICE SAFE RELEASE

Scope:
- No Supabase files, functions, tables, keys, policies, or schema were changed.
- Only community-hub.js and the cache version in index.html changed.
- Desktop/Android retain continuous voice recognition.
- iPhone/iPad use one tap per question to avoid Safari microphone permission loops.
- Persian and English audio replies use the existing TTS endpoint first, then browser speech as fallback.
- If Safari does not expose speech recognition, typing still works and the speaker button can read the reply aloud.

Important:
- Replace the site files on GitHub Pages, then hard-refresh the page.
- No action is required in Supabase.
