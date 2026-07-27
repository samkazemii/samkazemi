-- Starter schema for a future live Community Hub backend.
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  room text not null default 'control-room-01',
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  body text not null default '' check (char_length(body) <= 1200),
  reply_to uuid references public.community_messages(id) on delete set null,
  media jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.community_messages enable row level security;
create policy "read community messages" on public.community_messages for select using (true);
create policy "authenticated users post" on public.community_messages for insert to authenticated with check (auth.uid() = user_id);
create index if not exists community_messages_room_created_idx on public.community_messages(room, created_at desc);
alter publication supabase_realtime add table public.community_messages;
