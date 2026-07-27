# V18 REAL BUILD

Implemented in code:
- Instagram button beside Telegram (not inside Community Hub)
- Community table consistently uses `community_messages`
- Admin checkboxes on every message
- Select All, Clear, Delete Selected, Delete All
- Deletes verify returned database rows and report RLS failures
- Realtime insert/delete targets `community_messages`
- Final blue AI MODE control with red knob moving left/right
- V17 voice-loop protection retained

Required once: run `supabase-schema.sql` in Supabase SQL Editor.
