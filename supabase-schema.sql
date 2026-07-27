-- Sam Kazemi Community Hub V18 rebuilt
-- Safe migration for the community_messages table already created in your project.
-- Run this entire script once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Add the columns used by the rebuilt website without deleting existing data.
alter table public.community_messages add column if not exists client_id text;
alter table public.community_messages add column if not exists display_name text;
alter table public.community_messages add column if not exists body text;
alter table public.community_messages add column if not exists reply_to uuid;
alter table public.community_messages add column if not exists media jsonb not null default '[]'::jsonb;
alter table public.community_messages add column if not exists is_ai boolean not null default false;

-- Migrate values from the first table version, when those columns exist.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='community_messages' and column_name='username') then
    execute 'update public.community_messages set display_name = coalesce(display_name, username)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='community_messages' and column_name='content') then
    execute 'update public.community_messages set body = coalesce(body, content)';
  end if;
end $$;

update public.community_messages
set client_id=coalesce(client_id,'legacy-'||id::text),
    display_name=coalesce(nullif(display_name,''),'Guest'),
    body=coalesce(body,'');

alter table public.community_messages alter column client_id set not null;
alter table public.community_messages alter column display_name set not null;
alter table public.community_messages alter column body set not null;

-- Add reply relation only when it is not already present.
do $$
begin
  if not exists (select 1 from pg_constraint where conname='community_messages_reply_to_fkey') then
    alter table public.community_messages
      add constraint community_messages_reply_to_fkey
      foreign key (reply_to) references public.community_messages(id) on delete set null;
  end if;
end $$;

alter table public.community_messages enable row level security;
alter table public.community_messages replica identity full;

drop policy if exists "public can read community messages" on public.community_messages;
create policy "public can read community messages"
on public.community_messages for select to anon, authenticated using (true);

drop policy if exists "public can post community messages" on public.community_messages;
create policy "public can post community messages"
on public.community_messages for insert to anon, authenticated
with check (
  char_length(display_name) between 2 and 32
  and char_length(coalesce(body,'')) <= 4000
  and jsonb_array_length(coalesce(media,'[]'::jsonb)) <= 3
);

drop policy if exists "sam only delete community messages" on public.community_messages;
create policy "sam only delete community messages"
on public.community_messages for delete to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'sam.kazmi0090@gmail.com');

grant select, insert on public.community_messages to anon, authenticated;
grant delete on public.community_messages to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
end $$;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('community-media','community-media',true,12582912,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/webm','audio/mpeg','audio/wav','audio/ogg','audio/mp4'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "public can view community media" on storage.objects;
create policy "public can view community media" on storage.objects
for select to anon, authenticated using (bucket_id='community-media');

drop policy if exists "public can upload community media" on storage.objects;
create policy "public can upload community media" on storage.objects
for insert to anon, authenticated with check (bucket_id='community-media');

drop policy if exists "sam only delete community media" on storage.objects;
create policy "sam only delete community media" on storage.objects
for delete to authenticated
using (bucket_id='community-media' and lower(coalesce(auth.jwt() ->> 'email',''))='sam.kazmi0090@gmail.com');

notify pgrst, 'reload schema';
