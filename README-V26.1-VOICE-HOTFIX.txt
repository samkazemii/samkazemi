V26.1 VOICE HOTFIX
- Restores spoken AI replies.
- iPhone/iPad use the existing cloud TTS first because Safari SpeechSynthesis can silently fail after async requests.
- Other browsers keep fast browser speech first.
- Adds a timeout so browser speech cannot hang without falling back.
- No database, Community Hub schema, admin, piano, game, layout, or unrelated feature changes.
- No Supabase redeploy is required if sk-ai-tts was already working before V26.
