import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard · Bookspace" };

const BOOK_COLS =
  "id, author_id, title, slug, author_name, cover_url, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();
  const name = profile?.display_name || profile?.username || "reader";

  const { data: shelfRows } = await supabase.from("shelves").select("id").eq("owner_id", user.id);
  const shelfIds = (shelfRows ?? []).map((s) => s.id);

  const [inProgress, reviewsCount, shelvedCount, progressRows, recRows] = await Promise.all([
    supabase.from("reading_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    shelfIds.length
      ? supabase.from("shelf_items").select("*", { count: "exact", head: true }).in("shelf_id", shelfIds)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("reading_progress")
      .select(`percent, book:books!reading_progress_book_id_fkey(${BOOK_COLS})`)
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false })
      .limit(4),
    supabase
      .from("books")
      .select(BOOK_COLS)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("views", { ascending: false })
      .limit(4),
  ]);

  const continueReading = (progressRows.data ?? [])
    .map((p) => (p as unknown as { book: BookWithAuthor }).book)
    .filter(Boolean);
  const recommendations = (recRows.data ?? []) as unknown as BookWithAuthor[];

  const stats = [
    { label: "In progress", value: inProgress.count ?? 0 },
    { label: "On shelves", value: shelvedCount.count ?? 0 },
    { label: "Reviews written", value: reviewsCount.count ?? 0 },
  ];

  return (
    <>
      <p className="text-sm text-primary">Welcome back</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold">Hello, {name} 👋</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="font-serif text-3xl font-semibold text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Section title="Continue reading" href="/library" cta="My library" books={continueReading}>
        You aren&apos;t reading anything yet.
      </Section>

      <Section title="Recommended" href="/explore" cta="Explore" books={recommendations}>
        Nothing here yet.
      </Section>
    </>
  );
}

function Section({
  title,
  href,
  cta,
  books,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  books: BookWithAuthor[];
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
        <Button render={<Link href={href} />} nativeButton={false} variant="ghost" size="sm">
          {cta} →
        </Button>
      </div>
      {books.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{children}</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </section>
  );
}
