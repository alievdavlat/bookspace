import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookCard } from "@/components/book-card";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "My library · Bookspace" };

const BOOK_COLS =
  "id, author_id, title, slug, author_name, cover_url, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Continue reading
  const { data: progress } = await supabase
    .from("reading_progress")
    .select(`percent, book:books!reading_progress_book_id_fkey(${BOOK_COLS})`)
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false })
    .limit(8);

  // Shelves
  const { data: shelves } = await supabase
    .from("shelves")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  const shelfIds = (shelves ?? []).map((s) => s.id);
  const { data: items } = shelfIds.length
    ? await supabase
        .from("shelf_items")
        .select(`shelf_id, book:books!shelf_items_book_id_fkey(${BOOK_COLS})`)
        .in("shelf_id", shelfIds)
    : { data: [] as { shelf_id: string; book: BookWithAuthor }[] };

  const continueReading = (progress ?? [])
    .map((p) => (p as unknown as { book: BookWithAuthor }).book)
    .filter(Boolean);

  const byShelf = (shelfId: string) =>
    (items ?? [])
      .filter((i) => (i as { shelf_id: string }).shelf_id === shelfId)
      .map((i) => (i as unknown as { book: BookWithAuthor }).book)
      .filter(Boolean);

  const hasAnything = continueReading.length > 0 || (shelves ?? []).some((s) => byShelf(s.id).length);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">My library</h1>
      <p className="mt-1 text-muted-foreground">Your shelves and books in progress.</p>
      {!hasAnything ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
          <p className="font-serif text-2xl">Your library is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add books to a shelf from any book page, or{" "}
            <Link href="/explore" className="text-primary hover:underline">
              explore the library
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {continueReading.length > 0 && (
            <Shelf title="Continue reading" books={continueReading} />
          )}
          {(shelves ?? []).map((s) => {
            const books = byShelf(s.id);
            if (!books.length) return null;
            return <Shelf key={s.id} title={s.name} books={books} />;
          })}
        </div>
      )}
    </>
  );
}

function Shelf({ title, books }: { title: string; books: BookWithAuthor[] }) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
