import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { BookCard } from "@/components/book-card";
import { FollowButton } from "@/components/author/follow-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Community · Bookspace" };

const BOOK_COLS =
  "id, author_id, title, slug, author_name, cover_url, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)";

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type ReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  book: { title: string; slug: string; cover_url: string | null } | null;
  reviewer: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function CommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profileRows }, { data: followRows }, { data: bookAuthorRows }, { data: reviewRows }, { data: trendingRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .order("created_at", { ascending: false })
        .limit(18),
      supabase.from("follows").select("follower_id, following_id"),
      supabase
        .from("books")
        .select("author_id")
        .eq("status", "published")
        .eq("visibility", "public"),
      supabase
        .from("reviews")
        .select(
          "id, rating, body, created_at, book:books!reviews_book_id_fkey(title, slug, cover_url), reviewer:profiles!reviews_user_id_fkey(username, display_name, avatar_url)"
        )
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("books")
        .select(BOOK_COLS)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("views", { ascending: false })
        .limit(4),
    ]);

  const follows = (followRows ?? []) as { follower_id: string; following_id: string }[];
  const followerCount = new Map<string, number>();
  for (const f of follows) followerCount.set(f.following_id, (followerCount.get(f.following_id) ?? 0) + 1);
  const iFollow = new Set(follows.filter((f) => f.follower_id === user?.id).map((f) => f.following_id));

  const bookCount = new Map<string, number>();
  for (const b of (bookAuthorRows ?? []) as { author_id: string }[])
    bookCount.set(b.author_id, (bookCount.get(b.author_id) ?? 0) + 1);

  const people = ((profileRows ?? []) as ProfileRow[])
    .filter((p) => p.id !== user?.id && p.username)
    .sort((a, b) => (followerCount.get(b.id) ?? 0) - (followerCount.get(a.id) ?? 0));

  const reviews = (reviewRows ?? []) as unknown as ReviewRow[];
  const trending = (trendingRows ?? []) as unknown as BookWithAuthor[];

  return (
    <PageShell
      title="Community"
      subtitle="Discover readers and authors, see what people are saying, and find what's trending."
    >
      {/* People to discover */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold">People to discover</h2>
          {!user ? (
            <Link href="/sign-up" className="text-sm text-primary hover:underline">
              Join to follow →
            </Link>
          ) : null}
        </div>

        {people.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No one to show yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => {
              const name = p.display_name || p.username || "Reader";
              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <Link href={`/author/${p.username}`}>
                      <Avatar size="lg">
                        {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={name} /> : null}
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/author/${p.username}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {name}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">@{p.username}</p>
                    </div>
                  </div>

                  {p.bio ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{p.bio}</p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {followerCount.get(p.id) ?? 0} followers · {bookCount.get(p.id) ?? 0} books
                    </span>
                    {user ? (
                      <FollowButton
                        targetId={p.id}
                        username={p.username ?? ""}
                        isFollowing={iFollow.has(p.id)}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent reviews */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold">Recent reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No reviews yet. Be the first to{" "}
            <Link href="/explore" className="text-primary hover:underline">
              review a book
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((r) => {
              const reviewer =
                r.reviewer?.display_name || r.reviewer?.username || "A reader";
              return (
                <div key={r.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                  {r.book?.slug ? (
                    <Link href={`/book/${r.book.slug}`} className="shrink-0">
                      <div className="bs-cover h-24 w-16 overflow-hidden rounded-md border border-border bg-secondary">
                        {r.book.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.book.cover_url}
                            alt={r.book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </Link>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gold" aria-label={`${r.rating} out of 5`}>
                        {"★".repeat(r.rating)}
                        <span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span>
                      </span>
                    </div>
                    {r.book?.slug ? (
                      <Link
                        href={`/book/${r.book.slug}`}
                        className="mt-1 block truncate font-medium hover:text-primary"
                      >
                        {r.book.title}
                      </Link>
                    ) : null}
                    {r.body ? (
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{r.body}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">— {reviewer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold">Trending now</h2>
          <Link href="/explore" className="text-sm text-primary hover:underline">
            Explore all →
          </Link>
        </div>
        {trending.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {trending.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
