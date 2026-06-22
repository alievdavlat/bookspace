-- Bookspace RLS policies + storage buckets

-- enable RLS
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.blog_posts enable row level security;
alter table public.shelves enable row level security;
alter table public.shelf_items enable row level security;
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.highlights enable row level security;
alter table public.reviews enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;

-- profiles: public read, self write
create policy "profiles_read" on public.profiles for select using (true);
create policy "profiles_self_upd" on public.profiles for update using (auth.uid() = id);
create policy "profiles_self_ins" on public.profiles for insert with check (auth.uid() = id);

-- books: published+public readable by all; owner full access
create policy "books_public_read" on public.books for select
  using ((status = 'published' and visibility = 'public') or author_id = auth.uid());
create policy "books_owner_write" on public.books for all
  using (author_id = auth.uid()) with check (author_id = auth.uid());

-- chapters: readable if parent book readable; owner write
create policy "chapters_read" on public.chapters for select using (
  exists (select 1 from public.books b where b.id = book_id
    and ((b.status='published' and b.visibility='public') or b.author_id = auth.uid())));
create policy "chapters_owner_write" on public.chapters for all using (
  exists (select 1 from public.books b where b.id = book_id and b.author_id = auth.uid()))
  with check (
  exists (select 1 from public.books b where b.id = book_id and b.author_id = auth.uid()));

-- blog_posts: published readable; owner write
create policy "blog_read" on public.blog_posts for select
  using (status='published' or author_id = auth.uid());
create policy "blog_owner_write" on public.blog_posts for all
  using (author_id = auth.uid()) with check (author_id = auth.uid());

-- shelves: public or owner read; owner write
create policy "shelves_read" on public.shelves for select
  using (visibility='public' or owner_id = auth.uid());
create policy "shelves_owner_write" on public.shelves for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- shelf_items: follow shelf ownership
create policy "shelf_items_read" on public.shelf_items for select using (
  exists (select 1 from public.shelves s where s.id = shelf_id
    and (s.visibility='public' or s.owner_id = auth.uid())));
create policy "shelf_items_owner_write" on public.shelf_items for all using (
  exists (select 1 from public.shelves s where s.id = shelf_id and s.owner_id = auth.uid()))
  with check (
  exists (select 1 from public.shelves s where s.id = shelf_id and s.owner_id = auth.uid()));

-- per-user private data
create policy "progress_self" on public.reading_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bookmarks_self" on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "highlights_self" on public.highlights for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reviews/comments/likes: read all, write own
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_own_write" on public.reviews for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "comments_read" on public.comments for select using (true);
create policy "comments_own_write" on public.comments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "likes_read" on public.likes for select using (true);
create policy "likes_own_write" on public.likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- follows: read all, write own
create policy "follows_read" on public.follows for select using (true);
create policy "follows_own_write" on public.follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- storage buckets
insert into storage.buckets (id, name, public) values
  ('book-files','book-files', false),
  ('covers','covers', true),
  ('avatars','avatars', true)
on conflict (id) do nothing;

-- public read for covers/avatars
create policy "covers_public_read" on storage.objects for select
  using (bucket_id in ('covers','avatars'));
-- authenticated upload to covers/avatars/book-files
create policy "auth_upload" on storage.objects for insert to authenticated
  with check (bucket_id in ('covers','avatars','book-files'));
