SAM KAZEMI PORTFOLIO — V23

Only the requested Sam assistant and interactive additions were changed.
Community Hub, messages.body, admin tools, piano, core layout and existing features were preserved.

CHANGES
1. Renamed the visible AI identity to Sam / Sam Studio / Sam Mode.
2. Added Sam's bilingual identity and personality.
3. Added accurate answers about Sam Kazemi and who created the assistant.
4. Added persistent on-device conversation memory and visitor-name memory.
5. Added a real live-online visitor badge driven by existing Supabase Presence.
6. Added a short Control Room easter egg: click/tap an SK logo 5 times.
   It shows monitors, scanlines, ON AIR lighting and a short generated beep.
7. No new database table or Supabase schema change is required.

IMPORTANT DEPLOYMENT STEP
The updated assistant personality is in:
supabase/functions/sk-ai-chat/index.ts

Redeploy this Edge Function after uploading the website files:
supabase functions deploy sk-ai-chat

The visitor counter uses existing realtime Presence, so it requires the same working
Supabase configuration already used by Community Hub.
