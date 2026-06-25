<div align="center">

# 📚 Bookspace

### Read. Write. Share — a community library, all in one space.

Bookspace is a full-stack social reading platform: discover public-domain and community books,
read them in a **real 3D page-flip reader** (PDF) or a paginated **EPUB reader**, **write** your
own books chapter-by-chapter, blog, build playlists, follow readers, and discuss — with a
complete **admin back-office** on top.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20Storage-3ECF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## ✨ Features

### Read
- **3D page-flip reader** for PDFs (pdf.js → react-pageflip), with light / sepia / dark paper themes, **bookmarks**, page progress and fullscreen.
- **EPUB reader** (epub.js): paginated, table-of-contents, adjustable font size, themes, fullscreen — reading position saved and resumed.
- **Read-aloud** (free browser TTS) on blogs and written books.

### Write & publish
- **Notion/LinkedIn-grade rich editor** (Tiptap): headings, lists, quotes, code blocks, links, **image upload**, **video embeds**, **tables**, text-align, undo/redo.
- **Multi-chapter book writer** with a chapter sidebar (add / rename / reorder / delete) and **auto-save**.
- **Upload** PDF/EPUB (file or direct URL) with cover, or **write online**. **Blog** with the same editor.

### Discover & socialise
- **Explore** with Aceternity **focus-cards**, full-text-ish search and rich filters (genre, **all world languages**, type, length) in collapsible accordions.
- **Command-palette search** (⌘K) across books, people and posts.
- **YouTube-style profiles**: banner, avatar, status, stats, follow, and tabs (Books / Blog / Playlists / custom tabs / About) — About is a LinkedIn × YouTube × Instagram mix.
- **Playlists** of any books, **shelves** (Want to read / Reading / Read), **reviews & ratings**, **threaded comments**, **likes**, **follows**, an **activity feed**, and **notifications**.
- **AI** summarize & translate (free, open model via Pollinations).

### Admin & platform
- Role-gated **admin back-office** with a Strapi-style two-level sidebar: **Dashboard** (stats + charts), **Books** (table ↔ gallery, publish/delete), **Users** (inline roles), **Genres** (dynamic, feed the pickers), **Reports** (moderation), and a **Studio** with single + **bulk upload**.
- Blue / slate design system, **dark + light** themes, **PWA** installable, dynamic **OG images**, **breadcrumbs**, mobile nav, sanitized HTML, password-reset flow.

---

## 🧱 Tech stack

| Layer | Tech |
| --- | --- |
| Framework | **Next.js 16** (App Router, Server Actions, RSC) · React 19 · TypeScript |
| Backend | **Supabase** — Postgres + Auth + Storage, all behind **Row-Level Security** |
| UI | **shadcn/ui** (Base UI) · **Aceternity**-style motion (Framer Motion) · Tailwind v4 |
| Editor | **Tiptap** v3 |
| Readers | **pdf.js** + react-pageflip · **epub.js** |
| AI | **Pollinations** (free, open `openai-fast` / GPT-OSS) |
| Type | Fraunces (serif display) · Inter (body) |

---

## 🚀 Getting started

```bash
git clone <this-repo>
cd bookspace
npm install
cp .env.local.example .env.local     # add your Supabase URL + keys
npm run dev                           # http://localhost:3000
```

### Environment (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Supabase setup
1. Create a Supabase project, copy the URL + anon + service-role keys into `.env.local`.
2. Apply the SQL migrations in order from `supabase/migrations/` (SQL editor or `supabase db push`).
   They create ~14 tables, RLS policies, storage buckets (`book-files`, `covers`, `avatars`),
   a signup trigger, the `book_trending` view, notifications/reports, and seed genres.
3. (Optional) Configure SMTP in Supabase for email confirmation & password reset.

```bash
npm run build     # production build
npm run lint      # eslint
```

---

## 🗂️ Project structure

```
app/            App Router routes (explore, book, read, studio, admin, author, blog, feed, …)
components/     UI — ui/ (shadcn), aceternity/, reader/, editor/, social/, admin/, profile/…
lib/            actions/ (server actions) · supabase clients · sanitize · comments · languages
supabase/       SQL migrations
public/         covers, icons, pdf worker, PWA manifest
```

---

## 📜 License

MIT — free to read, fork and build on.

<div align="center"><sub>Built with Next.js, Supabase and a love of books.</sub></div>
