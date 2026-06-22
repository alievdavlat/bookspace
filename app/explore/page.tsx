import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GENRES, type BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Explore · Bookspace" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const { q, genre } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("books")
    .select(
      "id, author_id, title, slug, description, cover_url, language, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)"
    )
    .eq("status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (genre) query = query.contains("genres", [genre]);

  const { data } = await query;
  const books = (data ?? []) as unknown as BookWithAuthor[];

  return (
    <PageShell
      title="Explore"
      subtitle="Discover your next read across the community library."
    >
      {/* Search */}
      <form className="mt-8 flex max-w-md gap-2" action="/explore">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search titles…"
          aria-label="Search titles"
        />
        <Button type="submit">Search</Button>
      </form>

      {/* Genre filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/explore"
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            !genre
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-secondary"
          }`}
        >
          All
        </Link>
        {GENRES.map((g) => (
          <Link
            key={g}
            href={`/explore?genre=${g}`}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              genre === g
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
            }`}
          >
            {g}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {books.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          No books found{q ? ` for “${q}”` : ""}. Try another search or genre.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
