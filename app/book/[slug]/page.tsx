import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { AddToShelf } from "@/components/book/add-to-shelf";
import { AddToPlaylist } from "@/components/book/add-to-playlist";
import { ReviewSection, type ReviewItem } from "@/components/book/review-section";
import { languageName } from "@/lib/languages";
import type { BookWithAuthor } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("books").select("title").eq("slug", slug).single();
  return { title: data ? `${data.title} · Bookspace` : "Book · Bookspace" };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select(
      "id, author_id, title, slug, author_name, description, cover_url, language, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)"
    )
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const book = data as unknown as BookWithAuthor;
  const author =
    book.author_name || book.author?.display_name || book.author?.username || "Unknown";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviewData } = await supabase
    .from("reviews")
    .select("rating, body, created_at, user:profiles!reviews_user_id_fkey(username, display_name)")
    .eq("book_id", book.id)
    .order("created_at", { ascending: false });
  const reviews = (reviewData ?? []) as unknown as ReviewItem[];
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  let playlists: { id: string; title: string; has: boolean }[] = [];
  if (user) {
    const { data: pls } = await supabase
      .from("playlists")
      .select("id, title, playlist_items(book_id)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    playlists = (pls ?? []).map((p) => {
      const row = p as { id: string; title: string; playlist_items: { book_id: string }[] };
      return { id: row.id, title: row.title, has: (row.playlist_items ?? []).some((i) => i.book_id === book.id) };
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          {/* Cover */}
          <div className="bs-cover mx-auto aspect-[2/3] w-[220px] overflow-hidden rounded-xl border border-border bg-secondary shadow-md md:w-full">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center font-serif text-xl">
                {book.title}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-serif text-4xl font-semibold">{book.title}</h1>
            <p className="mt-2 text-muted-foreground">
              by{" "}
              {book.author_name ? (
                author
              ) : book.author?.username ? (
                <Link href={`/author/${book.author.username}`} className="text-primary hover:underline">
                  {author}
                </Link>
              ) : (
                author
              )}
            </p>

            {book.genres?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {book.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/explore?genre=${g}`}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href={`/read/${book.id}`} />} nativeButton={false} size="lg">
                Read
              </Button>
            </div>

            {user ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AddToShelf bookId={book.id} />
                <AddToPlaylist bookId={book.id} playlists={playlists} />
              </div>
            ) : null}

            <p className="mt-8 leading-relaxed text-foreground/90">{book.description}</p>

            <dl className="mt-8 grid max-w-sm grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Format</dt>
              <dd className="uppercase">{book.format}</dd>
              <dt className="text-muted-foreground">Pages</dt>
              <dd>{book.page_count || "—"}</dd>
              <dt className="text-muted-foreground">Language</dt>
              <dd>{languageName(book.language)}</dd>
            </dl>
          </div>
        </div>

        <ReviewSection
          bookId={book.id}
          slug={book.slug}
          reviews={reviews}
          avg={avg}
          canReview={!!user}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
