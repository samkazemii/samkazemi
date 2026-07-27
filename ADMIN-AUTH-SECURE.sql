-- V13.0 secure admin delete policy for the existing public.messages table.
-- Run once in Supabase Dashboard > SQL Editor.
-- IMPORTANT: First create/invite sam.kazmi0090@gmail.com in Authentication > Users.

alter table public.messages enable row level security;

-- Everyone may read and insert, matching the public community design.
drop policy if exists "public read messages" on public.messages;
create policy "public read messages" on public.messages
for select to anon, authenticated using (true);

drop policy if exists "public insert messages" on public.messages;
create policy "public insert messages" on public.messages
for insert to anon, authenticated
with check (
  char_length(display_name) between 2 and 32
  and char_length(coalesce(body,'')) <= 4000
  and jsonb_array_length(coalesce(media,'[]'::jsonb)) <= 3
);

-- Only the genuinely authenticated Supabase account with this email can delete.
-- Typing or knowing the email in the website does not satisfy auth.jwt().
drop policy if exists "sam only delete messages" on public.messages;
create policy "sam only delete messages" on public.messages
for delete to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'sam.kazmi0090@gmail.com');

grant select, insert on public.messages to anon, authenticated;
grant delete on public.messages to authenticated;

-- Realtime must include DELETE events. FULL identity makes the deleted row ID available.
alter table public.messages replica identity full;

-- Allow only Sam to remove uploaded media. Existing public upload/read policies can remain.
drop policy if exists "sam only delete community media" on storage.objects;
create policy "sam only delete community media" on storage.objects
for delete to authenticated
using (
  bucket_id = 'community-media'
  and lower(coalesce(auth.jwt() ->> 'email','')) = 'sam.kazmi0090@gmail.com'
);
