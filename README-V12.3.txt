SAM KAZEMI PORTFOLIO V12.3

Included:
- Local AI Studio: no Puter account or AI popup required.
- Voice AI with browser speech recognition + speech synthesis.
- AI MODE now powers the assistant; AI STUDIO opens the workspace; VOICE starts/stops conversation mode.
- Secure Supabase admin Magic Link and RLS-protected message deletion.
- Realtime DELETE handling.
- Restored Keyboard Mode toggle for the piano/sound pad.
- Expanded About section.
- Mobile responsive controls and cache-busted scripts.

REQUIRED BEFORE DEPLOYMENT:
1. Replace the placeholder/dummy key in supabase-config.js with the REAL Supabase publishable/anon key.
2. Create/invite sam.kazmi@live.com in Supabase Authentication > Users.
3. Run ADMIN-AUTH-SECURE.sql in Supabase SQL Editor.
4. In Supabase Authentication URL Configuration, add your production site URL (https://samkz.com) as an allowed redirect URL.

Voice notes:
- Speech synthesis works broadly.
- Speech recognition depends on browser support. Chrome/Edge on Android and desktop typically provide the best support. iOS Safari may fall back to typed AI Studio.
- Microphone access requires HTTPS, which GitHub Pages/custom HTTPS provides.
