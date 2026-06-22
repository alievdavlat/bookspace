import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { BookCard } from "@/components/book-card";
import { FollowButton } from "@/components/author/follow-button";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Profile · Bookspace" };

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: followers }, { count: following }, { data: bookData }, { data: followRow }] =
    await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
      supabase
        .from("books")
        .select(
          "id, author_id, title, slug, author_name, cover_url, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)"
        )
        .eq("author_id", profile.id)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false }),
      user
        ? supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const books = (bookData ?? []) as unknown as BookWithAuthor[];

  return (
    <PageShell title={profile.display_name || profile.username || username}>
      <div className="-mt-6 flex flex-wrap items-center gap-4">
        <p className="text-muted-foreground">@{profile.username}</p>
        <span className="text-sm text-muted-foreground">
          {followers ?? 0} followers · {following ?? 0} following
        </span>
        {user && user.id !== profile.id ? (
          <FollowButton targetId={profile.id} username={profile.username ?? ""} isFollowing={!!followRow} />
        ) : null}
      </div>

      {profile.bio ? <p className="mt-6 max-w-2xl text-muted-foreground">{profile.bio}</p> : null}

      <h2 className="mt-10 font-serif text-2xl font-semibold">Books</h2>
      {books.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No published books yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
