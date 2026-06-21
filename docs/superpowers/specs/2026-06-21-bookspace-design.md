# Bookspace — Mahsulot dizayni va biznes-logika (v1)

**Sana:** 2026-06-21
**Holat:** Dizayn TASDIQLANGAN — to'liq reja yozilmoqda
**Nom:** **Bookspace** (yakuniy) · `bookspace.app`
**Joylashuv:** `C:\Users\ACER\Desktop\bookspace`

## Tasdiqlangan qarorlar (foydalanuvchi, 2026-06-21)
- **Platforma:** Web SaaS (Next.js)
- **Backend:** Supabase (Auth + Postgres + Storage + RLS)
- **Pul:** to'liq bepul (lekin SaaS-ready arxitektura)
- **Nom:** Bookspace
- **Tema:** dual (light + dark), reader'da alohida oq/sepiya/qora
- **Reja qamrovi:** MVP'dan **final state'gacha barcha feature'lar bilan** to'liq;
  keyin bosqichma-bosqich (F0→F8) rivojlantiriladi

---

## 1. Mahsulot bir gapda

To'liq elektronlashtirilgan **community kutubxona SaaS** — odamlar kitob **o'qiydi**
(real sahifa-varaqlash bilan), o'z kitoblarini **ulashadi/yuklaydi**, onlayn
**kitob yozadi**, **blog** yuritadi va bir-birini kuzatib, sharhlab **jamiyat**
quradi. Hozircha hamma narsa **bepul**.

### Kim uchun (auditoriya)
- **O'quvchilar** — PDF/EPUB kitoblarni qulay, real "kitobdek" o'qmoqchi bo'lganlar.
- **Mualliflar** — o'z kitobini yuklab yoki onlayn yozib, ulashmoqchi bo'lganlar.
- **Bloggerlar** — adabiy/ilmiy postlar yozuvchilar.
- **Jamiyat** — kitob muhokamasi, javonlar, kuzatuv qiluvchilar.

### Asosiy qiymat (value prop)
1. **Real o'qish tajribasi** — 3D sahifa varaqlash (headline feature).
2. **Yarat + ulash** — yuklash YOKI onlayn yozish, bitta joyda.
3. **Bepul va ochiq** — paywall yo'q; community-markazli.

---

## 2. Texnologiya steki

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | SSR, SEO landing, server actions |
| UI kit | shadcn/ui (ilova) + Aceternity UI (landing) | so'ralgan; wow-landing + toza app |
| Animatsiya | Framer Motion | sahifa o'tishlari, micro-interactions |
| Backend | Supabase: Auth + Postgres + Storage + RLS | bitta platforma, tez MVP |
| PDF reader | pdf.js (render) + react-pageflip / StPageFlip (varaqlash) | real kitob effekti |
| EPUB reader | epub.js + pageflip | reflowable kitoblar |
| Editor | Tiptap (Notion-uslub rich text) | bob/blog yozish |
| Qidiruv | Postgres full-text → keyin Meilisearch | bepul start |
| Hosting | Vercel + Supabase cloud | bepul tier |

**Tasdiqlangan qarorlar (foydalanuvchi):** Web SaaS (Next.js), Supabase backend,
to'liq bepul (lekin SaaS-ready), nom kitobga aloqador "+books".

---

## 3. Sahifa xaritasi (routes)

### Public (marketing, SSR/SEO)
- `/` — Landing
- `/explore` — kitob katalogi (qidiruv + filtr)
- `/book/[slug]` — kitob sahifasi
- `/author/[username]` — muallif profili
- `/blog`, `/blog/[slug]` — blog feed va post
- `/pricing` — kelajak (hozir "hammasi bepul")
- `/sign-in`, `/sign-up`, `/forgot-password`

### Auth-gated (navbar avatar dropdown orqali)
- `/dashboard` — bosh panel
- `/library` — mening javonlarim + "davom et"
- `/read/[bookId]` — reader
- `/studio` — muallif studiyasi (kitob/blog ro'yxati)
- `/studio/book/new`, `/studio/book/[id]/edit` — kitob yozish/yuklash
- `/studio/blog/new`, `/studio/blog/[id]/edit` — blog yozish
- `/settings` — profil/akkaunt/o'qish sozlamalari

### Navbar xulqi
- **Chiqmagan:** logo + nav linklar + "Kirish" / "Ro'yxatdan o'tish" tugmalari.
- **Kirgan:** logo + nav + qidiruv + avatar dropdown:
  **Dashboard · Mening kutubxonam · Studio · Profil · Sozlamalar · Chiqish.**

---

## 4. Modullar va batafsil xulq (business logic)

### A. Landing (`/`)
Aceternity animatsiyalar bilan:
- Hero (aurora/spotlight background) + sarlavha + CTA ("Bepul boshlash").
- "Qanday ishlaydi" — 3 qadam (Top → O'qi → Yarat/Ulash).
- Feature bento-grid (reader, studio, blog, community).
- Jonli reader demo (kichik page-flip preview).
- Community statistika (kitoblar, mualliflar, o'quvchilar soni).
- Footer (linklar, til, ijtimoiy).
- Dual-theme toggle.

### B. Auth
- Supabase Auth: email+parol + **Google OAuth**.
- Sign-up: email, parol, **username** (unique), display name, **til** tanlash.
- Email tasdiqlash (Supabase confirm).
- Forgot/reset password.
- Kirgandan keyin → `/dashboard`.
- RLS: foydalanuvchi faqat o'z draftlari/progressini ko'radi; published kitoblar hammaga.

### C. Discovery / Katalog (`/explore`)
- Kitob kartalari: muqova, sarlavha, muallif, reyting, til/janr chip.
- Filtrlar: **janr · til · format (PDF/EPUB/written) · yangi · trend · bepul**.
- Qidiruv (full-text: title, author, description).
- Cheksiz scroll yoki paginatsiya.
- Seksiyalar: "Trend", "Yangi qo'shilgan", "Tavsiya", janr bo'yicha.

### D. Kitob sahifasi (`/book/[slug]`)
- Muqova, sarlavha, muallif (link), tavsif, til/janr, sahifa soni.
- Reyting (o'rtacha) + sharhlar ro'yxati.
- **"O'qish"** tugma → `/read/[bookId]`.
- **"Javonga qo'shish"** (dropdown: javon tanlash/yangi yaratish).
- Like, ulashish, o'xshash kitoblar.

### E. Reader (`/read/[bookId]`) — ⭐ HEADLINE
- **Sahifa-varaqlash:** desktop = ikki sahifali kitob ko'rinishi, 3D curl flip
  (react-pageflip / StPageFlip); mobil = bitta sahifa, swipe gesture.
- PDF: pdf.js sahifalarni canvas'ga render → pageflip'ga uzatish.
- EPUB: epub.js reflowable → ustunlarga bo'lib paginate + flip.
- Boshqaruv paneli: **mundarija (ToC), bookmark, highlight + izoh,
  shrift o'lchami, tema (oq/sepiya/qora), fullscreen, progress bar**.
- **O'qish progressi avto-saqlanadi** (reading_progress: position, percent).
- Bookmark va highlightlar Supabase'da saqlanadi (foydalanuvchiga bog'liq).
- Klaviatura: ← → varaqlash; mobil: swipe.

### F. Studio — kitob yaratish (`/studio`)
Ikki yo'l:
1. **Yuklash** — PDF/EPUB fayl (Supabase Storage) + muqova rasm + metadata
   (sarlavha, tavsif, janr, til). Sahifa soni avto-aniqlanadi.
2. **Onlayn yozish** — **boblar (chapters)** editor (Tiptap):
   - Bob qo'shish/tartiblash (drag-reorder).
   - Har bob rich-text; **draft avto-saqlash**.
   - Muqova generatsiya/yuklash.
   - "Nashr et" → status `published`.
- **Holatlar:** `draft → published` (va `archived`).
- **Ko'rinish:** `public` · `unlisted` (faqat link) · `private`.
- Studio ro'yxati: mening kitoblarim (holat, ko'rishlar, reyting), tahrirlash/o'chirish.

### G. Blog
- Tiptap editor (kitob editoriga o'xshash, lekin bitta sahifa post).
- Blog feed (`/blog`), post sahifasi (`/blog/[slug]`).
- Like + comment.
- Muallif bloglari profilida ko'rinadi.
- Holat: draft/published; SEO meta (title, description, cover).

### H. Community / Social
- **Profil** (`/author/[username]`): avatar, bio, kitoblar, bloglar, javonlar, follow tugma.
- **Follow** (follows jadvali) — kuzatish.
- **Reyting + sharh** (reviews) — 1-5 yulduz + matn.
- **Comment** (polymorphic: book/blog/review).
- **Javonlar (shelves/collections):** "O'qiyapman", "O'qilgan", "Keyinroq" + custom;
  public/private.
- **Like** (polymorphic).
- Faollik tasmasi (feed) — keyingi fazada.

### I. Dashboard (`/dashboard`)
- O'qish statistikasi: streak, jami soat, tugatilgan kitoblar.
- "Davom et" — yarim o'qilgan kitoblar.
- Tavsiyalar.
- Mening kitoblarim/bloglarim qisqacha (studio'ga link).
- So'nggi faollik.

---

## 5. Ma'lumotlar modeli (Supabase Postgres + RLS)

```
profiles      (id PK→auth.users, username unique, display_name, avatar_url, bio, language, role, plan, created_at)
books         (id, author_id→profiles, title, slug, description, cover_url, language,
               genres text[], type[uploaded|written], file_url, format[pdf|epub|written],
               status[draft|published|archived], visibility[public|unlisted|private],
               page_count, views, created_at, updated_at)
chapters      (id, book_id→books, "order", title, content jsonb)   -- written kitoblar uchun
blog_posts    (id, author_id, title, slug, cover_url, content jsonb, status, published_at)
shelves       (id, owner_id→profiles, name, visibility, is_system bool)
shelf_items   (shelf_id→shelves, book_id→books, added_at)   -- PK(shelf_id, book_id)
reading_progress (user_id, book_id, position, percent, last_read_at)   -- PK(user_id, book_id)
bookmarks     (id, user_id, book_id, position, label, created_at)
highlights    (id, user_id, book_id, text, position, color, note, created_at)
reviews       (id, book_id, user_id, rating 1-5, body, created_at)   -- unique(book_id,user_id)
comments      (id, target_type, target_id, user_id, body, parent_id, created_at)
likes         (id, user_id, target_type, target_id)   -- unique(user_id,target_type,target_id)
follows       (follower_id, following_id)   -- PK(follower_id, following_id)
genres        (id, name, slug)
```

**RLS qoidalari (qisqacha):**
- `books`: published+public hammaga `SELECT`; draft/private faqat egasiga.
- `reading_progress`, `bookmarks`, `highlights`: faqat o'z egasiga.
- `reviews`/`comments`/`likes`: o'qish hammaga, yozish auth user, edit/delete egasiga.
- Storage buckets: `book-files` (private, signed URL), `covers` (public), `avatars` (public).

---

## 6. Dizayn yo'nalishi

- **Estetika:** "Editorial / bookish" — nafis **serif display** sarlavhalar
  (Fraunces/Playfair) + toza **sans** UI (Inter). Iliq qog'oz-his palitra.
- **Dual theme:** dark to'liq qo'llab-quvvatlanadi (foydalanuvchi qoidasiga mos),
  + light. Reader'da alohida **oq/sepiya/qora** rejimlar.
- **Aceternity** faqat landing/marketingda "wow" uchun; ilova ichi shadcn — toza, tez.
- **Animatsiyalar:** Framer Motion sahifa o'tishlari, kartalar hover, reader varaqlash.
- Komponentlar bir maqsadli, alohida test qilinadigan bo'lib bo'linadi.

---

## 7. Bepul SaaS modeli

- Hozir **paywall yo'q** — hamma feature bepul.
- Arxitektura SaaS-ready: `profiles.plan`, `profiles.role` (reader/author) ustunlari.
- Kelajakda: Pro (offline, AI, cheksiz storage) + muallif sotuvi (komissiya) —
  narx muallif tanlovi (foydalanuvchining kurs-narx siyosatiga o'xshash).
- Hozircha hamma `plan='free'`.

---

## 8. To'liq feature inventari (MVP → final state)

Quyida **butun mahsulot** — barcha feature'lar, fazaga teglangan. Har feature ID
oladi, keyin har faza alohida plan → implementatsiya tsikliga kiradi.

### 8.1 Reading (o'qish) — yadro
- R1 page-flip PDF reader (desktop 2-sahifa 3D curl, mobil swipe) — **F3**
- R2 page-flip EPUB reader (reflowable, epub.js) — **F3**
- R3 o'qish progressi avto-saqlash (% + position) — **F3**
- R4 bookmark — **F3**
- R5 highlight + izoh (rangli) — **F3**
- R6 reader temalari (oq/sepiya/qora) + shrift o'lchami/oilasi — **F3**
- R7 mundarija (ToC) navigatsiya — **F3**
- R8 fullscreen + klaviatura/swipe boshqaruv — **F3**
- R9 lug'at/qidiruv kitob ichida — **F7**
- R10 TTS "read aloud" (bepul/browser SpeechSynthesis) — **F7**
- R11 offline o'qish (PWA cache) — **F8**

### 8.2 Library / Discovery (topish)
- D1 explore katalog + kitob kartalari — **F2**
- D2 qidiruv (full-text) — **F2**
- D3 filtrlar (janr/til/format/yangi/trend) — **F2**
- D4 kitob sahifasi (tavsif/muallif/reyting) — **F2**
- D5 javonlarga qo'shish — **F5**
- D6 tavsiya tizimi (genre/behavior based) — **F6**
- D7 Meilisearch tezkor qidiruv — **F8**

### 8.3 Authoring (yaratish)
- A1 kitob yuklash PDF/EPUB + metadata + muqova — **F2**
- A2 onlayn kitob yozish — boblar editor (Tiptap) — **F4**
- A3 draft avto-saqlash + versiya — **F4**
- A4 nashr holatlari (draft/published/archived) + ko'rinish (public/unlisted/private) — **F4**
- A5 blog yozish + feed + post sahifasi — **F4**
- A6 muqova generatsiya/yuklash — **F4**
- A7 seriyali nashr (boblarni vaqt bo'yicha chiqarish) — **F7**
- A8 hammuallif/jamoaviy yozish — **F8**

### 8.4 Community / Social
- C1 profil (`/author/[username]`) — **F1/F5**
- C2 follow / followers — **F5**
- C3 reyting + sharh (reviews) — **F5**
- C4 comment (polymorphic, threaded) — **F5**
- C5 like (polymorphic) — **F5**
- C6 javonlar (shelves/collections) public/private — **F5**
- C7 faollik tasmasi (activity feed) — **F6**
- C8 bildirishnomalar (notifications) — **F6**
- C9 o'qish challenge / gamifikatsiya (streak, badge) — **F7**
- C10 kitob klublari / guruh muhokama — **F8**

### 8.5 Account / Dashboard
- U1 auth (email+Google OAuth) + email tasdiq — **F1**
- U2 navbar avatar dropdown — **F1**
- U3 sozlamalar (profil/akkaunt/o'qish prefs) — **F1/F6**
- U4 dashboard + statistika (streak, soat, tugatilgan) — **F6**
- U5 "davom et" + tavsiyalar — **F6**

### 8.6 AI (bepul/open-source — foydalanuvchi qoidasi)
- AI1 kitob avto-xulosa (free/local model) — **F7**
- AI2 tavsif/teg generatsiya — **F7**
- AI3 tarjima (bob/blog) — **F7**
- AI4 semantik tavsiya/qidiruv (embeddings) — **F8**
> Eslatma: faqat bepul/open-source modellar (foydalanuvchi qattiq qoidasi).

### 8.7 Platforma / sifat
- P1 dizayn tizimi + dual theme — **F0**
- P2 SEO (metadata, sitemap, OG) — **F6**
- P3 i18n (uz/ru/en) — **F6**
- P4 PWA / offline — **F8**
- P5 analitika (muallif uchun ko'rishlar/o'qishlar) — **F7**
- P6 moderatsiya / report — **F7**
- P7 SaaS billing tayyorgarligi (plan/role, paywall keyin) — **F8**

---

## 9. Bosqichli yo'l xaritasi (F0 → F8, final state)

| Faza | Mazmun | Feature'lar | Natija |
|---|---|---|---|
| **F0 — Setup** | Next.js+Supabase+shadcn+aceternity, design system, DB schema, RLS, storage | P1 | ulangan skelet |
| **F1 — Shell** | Landing (aceternity), Auth, navbar/dropdown, theme, asosiy profil | U1,U2,C1,P1 | kirish/chiqish |
| **F2 — Katalog + Upload** | explore, qidiruv, filtr, book sahifasi, PDF/EPUB yuklash | D1-D4,A1 | kitob yuklash+ko'rish |
| **F3 — Reader ⭐** | page-flip PDF→EPUB, progress, bookmark, highlight, temalar, ToC | R1-R8 | real o'qish (mahsulot yuragi) |
| **F4 — Studio** | onlayn kitob yozish (boblar), blog, draft/nashr/ko'rinish | A2-A6 | yaratish tajribasi |
| **F5 — Community** | sharh, follow, comment, like, javonlar | C2-C6,D5 | jamiyat |
| **F6 — Dashboard + Polish** | dashboard, statistika, tavsiya, feed, notif, SEO, i18n | U3-U5,D6,C7,C8,P2,P3 | релиз-tayyor |
| **F7 — AI + Kengaytma** | AI xulosa/tarjima, TTS, lug'at, seriyali nashr, analitika, moderatsiya, gamifikatsiya | AI1-3,R9,R10,A7,P5,P6,C9 | aqlli platforma |
| **F8 — Scale** | Meilisearch, PWA/offline, jamoaviy yozish, klublar, semantik AI, billing-ready | D7,R11,A8,C10,AI4,P4,P7 | final state |

**Implementatsiya tartibi:** F0 → F1 → F2 → F3 (bu yergacha = ishlaydigan o'qish
MVP) → keyin F4…F8 ketma-ket. Har faza tugagach `verification-before-completion`
+ commit + main merge. Har faza o'z `writing-plans` rejasiga ega bo'ladi.

---

## 10. Konvensiya (foydalanuvchi loyiha standarti)

- Loyiha `Projects-Control-Hub.html` hubiga ulanadi.
- `Bookspace-DOCS.html` (vizual hujjat) + `Bookspace-PROGRESS.md` (har sessiya holati) yaratiladi.
- Har mazmunli o'zgarishdan keyin commit + `main`'ga merge.
- Frontend UI ishi `frontend-design` skill bilan (designer-grade, generic emas).
