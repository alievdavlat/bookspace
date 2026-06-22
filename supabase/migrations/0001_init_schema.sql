-- Bookspace initial schema
-- profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  language text default 'uz',
  role text not null default 'reader' check (role in ('reader','author','admin')),
  plan text not null default 'free',
  created_at timestamptz default now()
);

create table public.genres (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  description text,
  cover_url text,
  language text default 'uz',
  genres text[] default '{}',
  type text not null default 'uploaded' check (type in ('uploaded','written')),
  format text check (format in ('pdf','epub','written')),
  file_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  page_count int default 0,
  views int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index books_author_idx on public.books(author_id);
create index books_status_vis_idx on public.books(status, visibility);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  "order" int not null default 0,
  title text,
  content jsonb,
  created_at timestamptz default now()
);
create index chapters_book_idx on public.chapters(book_id, "order");

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  cover_url text,
  content jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz default now()
);

create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  visibility text not null default 'private' check (visibility in ('public','private')),
  is_system boolean not null default false,
  created_at timestamptz default now()
);

create table public.shelf_items (
  shelf_id uuid not null references public.shelves(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  added_at timestamptz default now(),
  primary key (shelf_id, book_id)
);

create table public.reading_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  position text,
  percent numeric default 0,
  last_read_at timestamptz default now(),
  primary key (user_id, book_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  position text,
  label text,
  created_at timestamptz default now()
);

create table public.highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  text text,
  position text,
  color text default 'yellow',
  note text,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz default now(),
  unique (book_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('book','blog','review')),
  target_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
create index comments_target_idx on public.comments(target_type, target_id);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('book','blog','comment','review')),
  target_id uuid not null,
  created_at timestamptz default now(),
  unique (user_id, target_type, target_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);
