import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookCard } from "@/components/book-card";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Playlist · Bookspace" };

const BOOK_COLS =
  "id, author_id, title, slug, author_name, cover_url, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: playlist } = await supabase
    .from("playlists")
    .select("id, title, description, owner_id, owner:profiles!playlists_owner_id_fkey(username, display_name)")
    .eq("id", id)
    .single();
  if (!playlist) notFound();

  const { data: itemRows } = await supabase
    .from("playlist_items")
    .select(`book:books!playlist_items_book_id_fkey(${BOOK_COLS})`)
    .eq("playlist_id", id)
    .order("order", { ascending: true });

  const books = (itemRows ?? [])
    .map((r) => (r as unknown as { book: BookWithAuthor }).book)
    .filter(Boolean);
  const owner = playlist.owner as unknown as { username: string | null; display_name: string | null } | null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="text-sm text-primary">Playlist</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold">{playlist.title}</h1>
        {owner?.username ? (
          <p className="mt-2 text-sm text-muted-foreground">
            by{" "}
            <Link href={`/author/${owner.username}`} className="hover:text-primary">
              {owner.display_name || owner.username}
            </Link>{" "}
            · {books.length} books
          </p>
        ) : null}
        {playlist.description ? (
          <p className="mt-3 max-w-2xl text-muted-foreground">{playlist.description}</p>
        ) : null}

        {books.length === 0 ? (
          <p className="mt-10 text-muted-foreground">This playlist is empty.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
