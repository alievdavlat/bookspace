import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListMusic } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/form-select";
import { createPlaylist } from "@/lib/actions/playlists";
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

  // Playlists
  const { data: playlistRows } = await supabase
    .from("playlists")
    .select("id, title, visibility, playlist_items(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const playlists = (playlistRows ?? []).map((p) => {
    const row = p as { id: string; title: string; visibility: string; playlist_items: { count: number }[] };
    return { id: row.id, title: row.title, visibility: row.visibility, count: row.playlist_items?.[0]?.count ?? 0 };
  });

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

      {/* Playlists */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold">Playlists</h2>
        <form action={createPlaylist} className="mt-4 flex max-w-md gap-2">
          <Input name="title" required placeholder="New playlist name" />
          <FormSelect
            name="visibility"
            defaultValue="public"
            className="w-32"
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ]}
          />
          <Button type="submit">Create</Button>
        </form>

        {playlists.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No playlists yet. Create one above, or use “Save to playlist” on any book.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((p) => (
              <Link
                key={p.id}
                href={`/playlist/${p.id}`}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <ListMusic className="size-5 text-primary" />
                <p className="mt-3 font-medium group-hover:text-primary">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.count} books · {p.visibility}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
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
