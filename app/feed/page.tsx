import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Star, PenLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Feed · Bookspace" };

type Actor = { username: string | null; display_name: string | null } | null;
type Activity = {
  key: string;
  date: string;
  actor: Actor;
  icon: "book" | "review" | "blog";
  text: string;
  href: string;
};

function actorName(a: Actor) {
  return a?.display_name || a?.username || "Someone";
}

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const ids = (follows ?? []).map((f) => (f as { following_id: string }).following_id);

  let items: Activity[] = [];
  if (ids.length) {
    const [books, reviews, posts] = await Promise.all([
      supabase
        .from("books")
        .select("id, title, slug, created_at, author:profiles!books_author_id_fkey(username, display_name)")
        .in("author_id", ids)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("reviews")
        .select("id, rating, created_at, book:books!reviews_book_id_fkey(title, slug), user:profiles!reviews_user_id_fkey(username, display_name)")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("blog_posts")
        .select("id, title, slug, published_at, created_at, author:profiles!blog_posts_author_id_fkey(username, display_name)")
        .in("author_id", ids)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20),
    ]);

    for (const b of (books.data ?? []) as Record<string, unknown>[])
      items.push({
        key: `book-${b.id}`,
        date: String(b.created_at),
        actor: b.author as Actor,
        icon: "book",
        text: `published a book`,
        href: `/book/${b.slug}`,
      });
    for (const r of (reviews.data ?? []) as Record<string, unknown>[]) {
      const book = r.book as { title: string; slug: string } | null;
      items.push({
        key: `review-${r.id}`,
        date: String(r.created_at),
        actor: r.user as Actor,
        icon: "review",
        text: `reviewed ${book?.title ?? "a book"} (${r.rating}★)`,
        href: book ? `/book/${book.slug}` : "/explore",
      });
    }
    for (const p of (posts.data ?? []) as Record<string, unknown>[])
      items.push({
        key: `blog-${p.id}`,
        date: String(p.published_at ?? p.created_at),
        actor: p.author as Actor,
        icon: "blog",
        text: `wrote a blog post`,
        href: `/blog/${p.slug}`,
      });

    items = items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40);
  }

  const Icon = { book: BookOpen, review: Star, blog: PenLine };

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Feed</h1>
      <p className="mt-1 text-muted-foreground">Latest from the readers and authors you follow.</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
          <p className="font-serif text-2xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow readers and authors from the{" "}
            <Link href="/community" className="text-primary hover:underline">
              community
            </Link>{" "}
            to see their activity.
          </p>
        </div>
      ) : (
        <ul className="mt-8 max-w-2xl space-y-3">
          {items.map((it) => {
            const I = Icon[it.icon];
            return (
              <li key={it.key} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <I className="size-4" />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p>
                    {it.actor?.username ? (
                      <Link href={`/author/${it.actor.username}`} className="font-medium hover:text-primary">
                        {actorName(it.actor)}
                      </Link>
                    ) : (
                      <span className="font-medium">{actorName(it.actor)}</span>
                    )}{" "}
                    <Link href={it.href} className="text-muted-foreground hover:text-foreground">
                      {it.text}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(it.date).toLocaleDateString()}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
