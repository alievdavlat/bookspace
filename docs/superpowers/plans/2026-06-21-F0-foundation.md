# Bookspace F0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a connected, themeable Next.js + Supabase skeleton with the full
database schema, RLS, storage buckets, design system, and a passing test harness —
so feature phases (F1+) can build on solid ground.

**Architecture:** Next.js 14 App Router (TypeScript) on Vercel. Supabase provides
Auth, Postgres (with Row-Level Security), and Storage. UI = shadcn/ui components +
Tailwind design tokens + Framer Motion (Aceternity deps). Database is defined as
versioned SQL migrations under `supabase/migrations/`. Vitest + Testing Library is
the test harness used from F0 onward.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion,
@supabase/supabase-js + @supabase/ssr, Supabase CLI, Vitest, @testing-library/react.

---

## File Structure (created in F0)

```
bookspace/
├─ app/
│  ├─ layout.tsx              # root layout: fonts, ThemeProvider, <body>
│  ├─ page.tsx                # placeholder home (replaced in F1)
│  └─ globals.css             # Tailwind + design tokens (CSS vars, dual theme)
├─ components/
│  ├─ theme-provider.tsx      # next-themes wrapper
│  └─ ui/                     # shadcn components (button, etc.)
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts            # browser client
│  │  └─ server.ts            # server client (cookies)
│  └─ utils.ts                # cn() helper (shadcn)
├─ supabase/
│  └─ migrations/
│     ├─ 0001_init_schema.sql # all tables from spec §5
│     └─ 0002_rls_storage.sql # RLS policies + storage buckets
├─ test/
│  ├─ setup.ts                # vitest + jsdom + jest-dom
│  └─ smoke.test.tsx          # renders a component, asserts
├─ .env.local.example         # env var names (no secrets)
├─ tailwind.config.ts
├─ vitest.config.ts
├─ tsconfig.json
└─ package.json
```

---

## Prerequisite (manual, one-time — do before Task 1)

Create the Supabase project (free tier) and capture credentials:

- [ ] **P.1** At https://supabase.com → New project named `bookspace`. Region: closest.
- [ ] **P.2** Project Settings → API: copy `Project URL`, `anon public` key, `service_role` key.
- [ ] **P.3** Save them into `bookspace/.env.local` (created in Task 2):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> If a Supabase project cannot be created yet, the local build/tests in F0 still pass
> (they don't hit the network). DB tasks (7–9) need the project. Note this in PROGRESS.

---

## Task 1: Scaffold Next.js app

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Scaffold in the existing folder**

Run (PowerShell, from `C:\Users\ACER\Desktop`):
```bash
npx create-next-app@latest bookspace --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```
When prompted that the directory is not empty (docs/.git exist), choose to continue/overwrite-merge. Accept defaults otherwise.

- [ ] **Step 2: Verify dev server boots**

Run:
```bash
cd bookspace && npm run dev
```
Expected: server at http://localhost:3000, default page renders. Stop with Ctrl+C.

- [ ] **Step 3: Verify typecheck + build**

Run:
```bash
npx tsc --noEmit && npm run build
```
Expected: no type errors; build completes.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore(F0): scaffold Next.js 14 app (ts, tailwind, app router)"
```

---

## Task 2: Environment + Supabase clients

**Files:**
- Create: `.env.local.example`, `.env.local`, `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Install Supabase libs**

```bash
npm i @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
Copy to `.env.local` and fill from prerequisite P.2.

- [ ] **Step 3: Browser client `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Server client `lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );
}
```

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(F0): add supabase browser/server clients + env template"
```

---

## Task 3: Test harness (Vitest + Testing Library)

**Files:**
- Create: `vitest.config.ts`, `test/setup.ts`, `test/smoke.test.tsx`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install dev deps**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./test/setup.ts"], globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: `test/setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Write the failing smoke test `test/smoke.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello() {
  return <h1>Bookspace</h1>;
}

describe("smoke", () => {
  it("renders the brand name", () => {
    render(<Hello />);
    expect(screen.getByText("Bookspace")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Add test script to `package.json`**

In `"scripts"` add: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 6: Run the test**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "test(F0): add vitest + testing-library harness with smoke test"
```

---

## Task 4: shadcn/ui setup

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`

- [ ] **Step 1: Init shadcn**

```bash
npx shadcn@latest init -d
```
Choose defaults (style: default, base color: slate, CSS variables: yes).

- [ ] **Step 2: Add a base component**

```bash
npx shadcn@latest add button
```

- [ ] **Step 3: Failing test `test/button.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Read</Button>);
    expect(screen.getByRole("button", { name: "Read" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test**

Run: `npm test`
Expected: all passed (smoke + button).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(F0): configure shadcn/ui + add Button, cn() util"
```

---

## Task 5: Design tokens + dual theme

**Files:**
- Modify: `app/globals.css` (token CSS vars for light+dark)
- Create: `components/theme-provider.tsx`
- Modify: `app/layout.tsx` (fonts + ThemeProvider)

- [ ] **Step 1: Install theme + fonts deps**

```bash
npm i next-themes
```

- [ ] **Step 2: Add editorial fonts in `app/layout.tsx`**

Use `next/font/google`: `Inter` (sans, UI) and `Fraunces` (serif, display).
```tsx
import { Inter, Fraunces } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif" });
```
Apply `${inter.variable} ${fraunces.variable}` to `<html>`.

- [ ] **Step 3: `components/theme-provider.tsx`**

```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 4: Wrap app in `app/layout.tsx`**

```tsx
<html lang="en" suppressHydrationWarning>
  <body className={`${inter.variable} ${fraunces.variable} font-sans`}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

- [ ] **Step 5: Map fonts in `tailwind.config.ts`**

In `theme.extend.fontFamily`: `sans: ["var(--font-sans)"]`, `serif: ["var(--font-serif)"]`.

- [ ] **Step 6: Verify build + tests**

Run: `npm run build && npm test`
Expected: build ok, tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(F0): dual theme (next-themes) + editorial fonts + tokens"
```

---

## Task 6: Aceternity dependencies (no components yet)

**Files:**
- Modify: `package.json`
- Create: `lib/motion.ts` (re-export helper, optional)

- [ ] **Step 1: Install motion + utils Aceternity relies on**

```bash
npm i framer-motion clsx tailwind-merge
```
(Note: `cn()` from Task 4 already uses clsx+tailwind-merge — confirm present.)

- [ ] **Step 2: Smoke-render a motion element `test/motion.test.tsx`**

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { motion } from "framer-motion";

describe("framer-motion", () => {
  it("renders a motion.div", () => {
    const { container } = render(<motion.div data-testid="m" />);
    expect(container.querySelector('[data-testid="m"]')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore(F0): add framer-motion (Aceternity dep base)"
```

---

## Task 7: Database schema migration

**Files:**
- Create: `supabase/migrations/0001_init_schema.sql`

- [ ] **Step 1: Install Supabase CLI + init**

```bash
npm i -D supabase
npx supabase init
```
Accept defaults (creates `supabase/` config).

- [ ] **Step 2: Write `supabase/migrations/0001_init_schema.sql`**

```sql
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
```

- [ ] **Step 3: Push migration to Supabase**

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```
Expected: `0001_init_schema.sql` applied. (Skip if project not yet created — note in PROGRESS.)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(F0): initial Postgres schema (profiles, books, social)"
```

---

## Task 8: RLS policies + storage buckets

**Files:**
- Create: `supabase/migrations/0002_rls_storage.sql`

- [ ] **Step 1: Write `supabase/migrations/0002_rls_storage.sql`**

```sql
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

-- books: public+published readable by all; owner full access
create policy "books_public_read" on public.books for select
  using (status = 'published' and visibility = 'public' or author_id = auth.uid());
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
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```
Expected: `0002_rls_storage.sql` applied. (Skip if project not created — note in PROGRESS.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(F0): RLS policies + storage buckets"
```

---

## Task 9: Profile auto-creation trigger

**Files:**
- Create: `supabase/migrations/0003_profile_trigger.sql`

- [ ] **Step 1: Write `supabase/migrations/0003_profile_trigger.sql`**

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```
Expected: applied. (Skip if no project — note in PROGRESS.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(F0): auto-create profile on signup (trigger)"
```

---

## Task 10: README + PROGRESS + hub wiring

**Files:**
- Create: `README.md`, `Bookspace-PROGRESS.md`
- Modify: `C:\Users\ACER\Desktop\Projects-Control-Hub.html` (add Bookspace card)

- [ ] **Step 1: Write `README.md`**

Short: what Bookspace is, stack, `npm run dev`, link to spec + plans.

- [ ] **Step 2: Write `Bookspace-PROGRESS.md`**

Record: F0 done items, Supabase project status (created? migrations applied?), next = F1.

- [ ] **Step 3: Add a Bookspace card to the control hub**

Add a project card linking to `Bookspace-PROGRESS.md` (status: F0 done).

- [ ] **Step 4: Final F0 verification**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: all green.

- [ ] **Step 5: Commit + merge to main**

```bash
git add -A && git commit -m "docs(F0): README, PROGRESS, hub card"
```
(F0 built on `main`; if a branch was used, merge to `main` per project convention.)

---

## Self-Review notes (spec coverage for F0)

- Spec §2 stack → Tasks 1,2,4,5,6,7 (Next, Supabase, shadcn, theme, motion). ✓
- Spec §5 data model → Tasks 7,8,9 (schema, RLS, trigger). ✓
- Spec §6 design (dual theme, editorial fonts) → Task 5. ✓
- Spec §7 SaaS-ready (plan/role columns) → Task 7 profiles. ✓
- Spec §10 conventions (PROGRESS, hub, commit) → Task 10. ✓
- Feature work (R/D/A/C/U/AI) → deferred to F1+ plans (out of F0 scope, by design).

**Next plan after F0:** `2026-..-F1-shell.md` (Landing + Auth + navbar/dropdown + profile).
