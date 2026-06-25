-- Phase 4: richer profiles + flexible sections + playlists.
alter table public.profiles
  add column if not exists banner_url text,
  add column if not exists status text,
  add column if not exists location text,
  add column if not exists website text;

-- Flexible profile content: About blocks + custom tabs.
create table if not exists public.profile_sections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'about' check (kind in ('about','tab')),
  title text not null,
  body text,
  "order" int not null default 0,
  created_at timestamptz default now()
);
alter table public.profile_sections enable row level security;
drop policy if exists profile_sections_read on public.profile_sections;
create policy profile_sections_read on public.profile_sections for select using (true);
drop policy if exists profile_sections_owner on public.profile_sections;
create policy profile_sections_owner on public.profile_sections for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Playlists of any books (YouTube-style).
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz default now()
);
create table if not exists public.playlist_items (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  added_at timestamptz default now(),
  "order" int default 0,
  primary key (playlist_id, book_id)
);
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
drop policy if exists playlists_read on public.playlists;
create policy playlists_read on public.playlists for select using (visibility = 'public' or owner_id = auth.uid());
drop policy if exists playlists_owner on public.playlists;
create policy playlists_owner on public.playlists for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists playlist_items_read on public.playlist_items;
create policy playlist_items_read on public.playlist_items for select using (
  exists (select 1 from public.playlists p where p.id = playlist_id and (p.visibility = 'public' or p.owner_id = auth.uid()))
);
drop policy if exists playlist_items_owner on public.playlist_items;
create policy playlist_items_owner on public.playlist_items for all using (
  exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid())
) with check (
  exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid())
);
