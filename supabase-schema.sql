-- V18 CLEAN: keep the original working public.messages table.
-- Do not rename the table and do not add community_messages/body/content columns.
-- Run ADMIN-AUTH-SECURE.sql only if admin deletion is blocked.

-- Ensure Realtime includes the existing messages table.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

alter table public.messages replica identity full;
notify pgrst, 'reload schema';
