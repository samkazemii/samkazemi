SAM KAZEMI PORTFOLIO — V26 PRO

Changes are limited to Sam UI, Control Room easter egg and Voice responsiveness.

UI
- Removed duplicate Sam / SAM labels from AI messages.
- Replaced remaining visible SK AI identity with Sam.
- Control Room overlay is now HTML-hidden until five logo taps, preventing raw content flashes.
- Rebuilt the easter egg as a staged broadcast HUD with monitors, UTC clock, scan sweep and subtle audio cue.

VOICE
- iPhone uses local MediaRecorder + silence detection + sk-ai-stt.
- Faster silence cutoff, shorter no-speech and maximum-recording windows.
- Shorter network timeouts and smaller conversation payload.
- Android/Desktop Web Speech flow remains intact.

UNCHANGED
- Community message schema (messages.body)
- Supabase tables and RLS
- Admin tools
- Piano, game, media and page layout

DEPLOYMENT
1) Upload all website files to GitHub Pages.
2) In Supabase, redeploy these included functions:
   supabase functions deploy sk-ai-chat --no-verify-jwt
   supabase functions deploy sk-ai-stt --no-verify-jwt
   supabase functions deploy sk-ai-tts --no-verify-jwt
No SQL changes are required.
