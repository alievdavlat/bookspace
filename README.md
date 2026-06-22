# Bookspace

A community library SaaS — read books with realistic **page-flip**, **share** and
**write** your own books, and write **blogs**. Free, editorial, dual-theme.

## Stack
- **Next.js 16** (App Router, TypeScript)
- **Supabase** — Auth + Postgres + Storage (RLS)
- **shadcn/ui** + **Aceternity** (Framer Motion) — warm editorial design, dual theme
- **Vitest** + Testing Library

## Getting started
```bash
npm install
cp .env.local.example .env.local   # fill Supabase URL + keys
npm run dev                         # http://localhost:3000
npm test                            # run the test suite
npm run build                       # production build
```

## Supabase setup
1. Create a Supabase project named `bookspace`, copy URL + anon + service_role keys into `.env.local`.
2. Apply migrations: `npx supabase link --project-ref <ref> && npx supabase db push`
   (or paste `supabase/migrations/*.sql` into the SQL editor in order).

## Docs
- Product design / business logic: `docs/superpowers/specs/2026-06-21-bookspace-design.md`
- Phase plans: `docs/superpowers/plans/` (F0 done; F1–F8 added as we build)
- Live state: `Bookspace-PROGRESS.md`
- Visual design reference: `design-ref/Bookspace.dc.html`

## Roadmap
F0 Setup ✓ · F1 Shell · F2 Catalog+upload · F3 Reader (page-flip) ·
F4 Studio (write) · F5 Community · F6 Dashboard+polish · F7 AI+extend · F8 Scale.
