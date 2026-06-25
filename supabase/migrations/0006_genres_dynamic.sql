-- Phase 2: dynamic genres + admin management
-- Promote the founding account to admin.
update public.profiles set role = 'admin' where username = 'aliev';

-- Seed the initial genre set (idempotent).
insert into public.genres (name, slug) values
  ('Classic','classic'),
  ('Romance','romance'),
  ('Horror','horror'),
  ('SciFi','scifi'),
  ('Mystery','mystery'),
  ('Fantasy','fantasy'),
  ('Adventure','adventure'),
  ('Childrens','childrens')
on conflict (slug) do nothing;

-- genres: read by all, write by admins only.
alter table public.genres enable row level security;
drop policy if exists genres_read on public.genres;
create policy genres_read on public.genres for select using (true);
drop policy if exists genres_admin_write on public.genres;
create policy genres_admin_write on public.genres for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admins can manage every book (read drafts/private, edit, delete).
drop policy if exists books_admin_all on public.books;
create policy books_admin_all on public.books for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

grant select on public.genres to anon, authenticated;
