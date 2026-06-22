# Bookspace — PROGRESS (live state)

> Read this first each session. Update at the end of every session.

**Last updated:** 2026-06-21
**Repo:** `C:\Users\ACER\Desktop\bookspace` · branch flow: feature branch → `main`

## Locked decisions
- Name **Bookspace**; Web SaaS; **Next.js 16** + **Supabase**; **shadcn + Aceternity**; **dual theme**; **fully free** (SaaS-ready).
- Headline feature: real **page-flip** reader (PDF+EPUB).
- Design = warm editorial (Fraunces + Inter, terracotta palette) — see `design-ref/Bookspace.dc.html`.

## Done
- ✅ Product spec (F0–F8, ~45 features): `docs/superpowers/specs/2026-06-21-bookspace-design.md`
- ✅ F0 plan: `docs/superpowers/plans/2026-06-21-F0-foundation.md`
- ✅ **F0 Foundation implemented** on branch `f0-foundation`:
  - Next.js 16 scaffold (TS, Tailwind v4, App Router)
  - Supabase browser/server clients + env template
  - Vitest + Testing Library harness (3 tests passing)
  - shadcn/ui (Button, cn())
  - Dual theme (next-themes) + Fraunces/Inter + warm tokens (light+dark) + ThemeToggle + branded home
  - Framer Motion (Aceternity base)
  - Supabase migrations written: `0001_init_schema`, `0002_rls_storage`, `0003_profile_trigger`

## Infra status ⚠️
- **Supabase `bookspace` project: NOT created yet.** Migrations are written but **NOT pushed**.
  - TODO (user): create project, put URL + anon + service_role into `.env.local`,
    then `npx supabase link --project-ref <ref> && npx supabase db push`.
- speaking-app's `speaking-ai` Supabase is a DIFFERENT project — do not reuse.

## Next
1. Create + connect the `bookspace` Supabase project; push migrations; verify auth signup creates a profile.
2. **F1 — Shell:** Landing (Aceternity hero) + Auth (email + Google) + navbar/avatar dropdown + profile. Write `docs/superpowers/plans/...-F1-shell.md` first.
3. Then F2 (catalog + upload) → F3 (reader ⭐).

## Verification (F0)
`npx tsc --noEmit` ✓ · `npm test` (3 pass) ✓ · `npm run build` ✓
