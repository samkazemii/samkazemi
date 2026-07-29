V27 — Voice rebuild (isolated change)

Changed files:
- community-hub.js
- index.html (cache-busting version only)

Voice behavior:
- Desktop/Android: Web Speech recognition; cloud TTS first, browser TTS fallback.
- iPhone/iPad: MediaRecorder -> sk-ai-stt -> Sam -> sk-ai-tts -> Web Audio playback.
- Persian language is selected automatically from the answer text.
- iOS microphone stream is retained during an active voice session to prevent repeated permission prompts.
- On STT failure the voice session stops instead of repeatedly reopening the microphone.

Supabase requirement for iPhone/iPad:
- The included sk-ai-stt Edge Function must be deployed.
- Existing sk-ai-tts must also be deployed and have GEMINI_API_KEY configured.

No database/schema changes are required.
