V24 — iPhone Voice + Speed Fix

Changes only to Sam voice mode:
- iPhone/Safari now uses microphone recording + automatic silence detection.
- Added sk-ai-stt Edge Function for reliable Persian/English transcription on iOS.
- Android/Desktop keep Web Speech recognition.
- Voice output starts with the browser voice immediately; cloud TTS is fallback only.
- Reduced restart delays so the next listening cycle begins faster.

Deploy after uploading:
supabase functions deploy sk-ai-chat --no-verify-jwt
supabase functions deploy sk-ai-tts --no-verify-jwt
supabase functions deploy sk-ai-stt --no-verify-jwt

Required secret (already used by chat/TTS):
GEMINI_API_KEY
