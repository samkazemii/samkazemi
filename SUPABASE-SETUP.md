# Community Hub — live backend setup

The included Community Hub opens and works immediately in **Preview Mode**. In that mode, messages and small attachments are stored only in the current browser. This avoids pretending that a static GitHub Pages site already has a server.

To make it a real multi-user room, use a free Supabase project:

1. Create a Supabase project.
2. Run `supabase-schema.sql` in SQL Editor.
3. Create a public Storage bucket named `community-media` and set limits appropriate for screenshots, short clips and voice notes.
4. Put the public Project URL and **anon** key in `community-config.js`. Never paste the service-role key or an AI provider secret into GitHub.
5. Connect email notifications and AI through Supabase Edge Functions. Store provider secrets only as Edge Function secrets.

## Important moderation and privacy notes

- Require verified email or magic-link authentication before public launch.
- Add rate limiting, reporting, blocking, and an admin delete/ban panel.
- Do not allow users to upload confidential control-room screenshots, credentials, political workplace details, personal documents, or copyrighted media they do not own.
- Scan uploads and cap file size/duration.
- AI image/video analysis is not truly free at unlimited scale. Use quotas and a daily per-user limit.

The current front-end intentionally does not expose private API keys and does not claim that preview messages are visible to other users.
