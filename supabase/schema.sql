-- Reel Plan — board condivisa (esegui tutto in SQL Editor di Supabase)
-- Sostituisci le due email qui sotto con le vostre, poi premi Run.

create table if not exists public.allowed_emails (
  email text primary key
);

insert into public.allowed_emails (email) values
  ('tua-email@esempio.com'),
  ('email-amico@esempio.com')
on conflict (email) do nothing;

create table if not exists public.reels (
  id uuid primary key,
  title text not null default '',
  hook text not null default '',
  script text not null default '',
  shot_list text not null default '',
  audio text not null default '',
  platforms text[] not null default array['instagram']::text[],
  status text not null default 'idea',
  priority text not null default 'medium',
  record_date date,
  publish_date date,
  duration_sec integer not null default 30,
  caption text not null default '',
  hashtags text not null default '',
  location text not null default '',
  outfit text not null default '',
  props text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reels_status_idx on public.reels (status);
create index if not exists reels_record_date_idx on public.reels (record_date);
create index if not exists reels_publish_date_idx on public.reels (publish_date);

create or replace function public.is_board_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_board_member() from public;
grant execute on function public.is_board_member() to authenticated;

alter table public.allowed_emails enable row level security;
alter table public.reels enable row level security;

drop policy if exists "members read allowlist" on public.allowed_emails;
create policy "members read allowlist"
on public.allowed_emails
for select
to authenticated
using (public.is_board_member());

drop policy if exists "members read reels" on public.reels;
create policy "members read reels"
on public.reels
for select
to authenticated
using (public.is_board_member());

drop policy if exists "members insert reels" on public.reels;
create policy "members insert reels"
on public.reels
for insert
to authenticated
with check (public.is_board_member());

drop policy if exists "members update reels" on public.reels;
create policy "members update reels"
on public.reels
for update
to authenticated
using (public.is_board_member())
with check (public.is_board_member());

drop policy if exists "members delete reels" on public.reels;
create policy "members delete reels"
on public.reels
for delete
to authenticated
using (public.is_board_member());

alter table public.reels replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reels'
  ) then
    execute 'alter publication supabase_realtime add table public.reels';
  end if;
end
$$;
