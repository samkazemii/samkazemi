# V18 — Community Hub 2.0

## Included
- Fixed the database table mismatch: the frontend now uses `community_messages`.
- Real database deletion with visible errors instead of silently hiding messages.
- Admin checkboxes beside every message.
- Select All, Clear Selection, Delete Selected, and Delete All.
- Admin pin/unpin with pinned messages sorted first.
- Realtime INSERT, UPDATE, and DELETE synchronization.
- Secure RLS: only `sam.kazmi00990@gmail.com` can update/delete.
- Instagram button linked to `https://instagram.com/samkazami`.
- V17 voice-loop protection and AI toggle retained.

## Required Supabase step
Open **Supabase → SQL Editor**, paste the full contents of `supabase-schema.sql`, and press **Run** once.
Without this step, the table and delete/update policies do not exist.

## Deploy
Upload all files to the GitHub Pages repository, replacing the old files.
