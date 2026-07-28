V18.6 — Community Presence + Mobile Voice Fix

Only community-hub.js was changed.

1) Online count / presence
- All visitors now join the same Supabase Realtime channel.
- Presence is deduplicated by client ID before displaying the count.
- Existing messages, database schema, UI and admin tools are unchanged.

2) Voice AI on mobile
- Mobile Safari/Chrome now completes microphone permission first.
- The temporary permission stream is fully released.
- SpeechRecognition is then created fresh after a short audio-route settling delay.
- Added a guarded startup watchdog and clean retry for stuck mobile sessions.
- The existing desktop startup path is preserved.
