# V18 Rebuilt

- Community code and SQL now use only `public.community_messages`.
- Realtime INSERT/DELETE use the same table.
- Admin bulk controls: Select All, Clear, Delete Selected, Delete All.
- Instagram button is beside Telegram and links to @samkazami.
- Secure deletion remains protected by Supabase Auth + RLS.

## Required setup
Run `supabase-schema.sql` once in Supabase SQL Editor, deploy all files, then hard-refresh the site.
