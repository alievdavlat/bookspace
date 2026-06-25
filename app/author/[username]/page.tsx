import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FollowButton } from "@/components/author/follow-button";
import {
  ProfileTabs,
  type ProfilePost,
  type ProfileSection,
  type ProfilePlaylist,
} from "@/components/profile/profile-tabs";
import { AuroraBackground } from "@/components/aceternity/aurora-background";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Profile · Bookspace" };

const BOOK_COLS =
  "id, author_id, title, slug, author_name, cover_url, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)";

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, status, location, website, avatar_url, banner_url, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: followers },
    { count: following },
    { data: bookData },
    { data: postData },
    { data: followRow },
    { data: sectionData },
    { data: playlistData },
  ] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase
      .from("books")
      .select(BOOK_COLS)
      .eq("author_id", profile.id)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false }),
    supabase
      .from("blog_posts")
      .select("id, title, slug, published_at, created_at")
      .eq("author_id", profile.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    user
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("profile_sections")
      .select("id, kind, title, body")
      .eq("profile_id", profile.id)
      .order("order", { ascending: true }),
    supabase
      .from("playlists")
      .select("id, title, description, visibility, playlist_items(count)")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const books = (bookData ?? []) as unknown as BookWithAuthor[];
  const posts = (postData ?? []) as ProfilePost[];
  const allSections = (sectionData ?? []) as (ProfileSection & { kind: "about" | "tab" })[];
  const aboutSections = allSections.filter((s) => s.kind === "about");
  const customTabs = allSections.filter((s) => s.kind === "tab");
  const playlists: ProfilePlaylist[] = (playlistData ?? [])
    .filter((p) => (p as { visibility: string }).visibility === "public" || (user && user.id === profile.id))
    .map((p) => {
      const row = p as { id: string; title: string; description: string | null; playlist_items: { count: number }[] };
      return { id: row.id, title: row.title, description: row.description, count: row.playlist_items?.[0]?.count ?? 0 };
    });
  const name = profile.display_name || profile.username || username;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Banner */}
        {profile.banner_url ? (
          <div
            className="h-40 w-full bg-cover bg-center sm:h-52"
            style={{ backgroundImage: `url(${profile.banner_url})` }}
          />
        ) : (
          <AuroraBackground className="h-40 w-full bg-[linear-gradient(120deg,#1e3a8a,#2563eb)] text-white sm:h-52" />
        )}

        <div className="mx-auto w-full max-w-6xl px-6">
          {/* Header row */}
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="size-24 border-4 border-background sm:size-28">
                {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={name} /> : null}
                <AvatarFallback className="bg-secondary text-2xl text-secondary-foreground">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="font-serif text-3xl font-semibold">{name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.status ? <p className="mt-1 text-sm">{profile.status}</p> : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  {followers ?? 0} followers · {following ?? 0} following · {books.length} books
                </p>
              </div>
            </div>
            {user && user.id !== profile.id ? (
              <FollowButton targetId={profile.id} username={profile.username ?? ""} isFollowing={!!followRow} />
            ) : null}
          </div>

          <ProfileTabs
            books={books}
            posts={posts}
            playlists={playlists}
            aboutSections={aboutSections}
            customTabs={customTabs}
            bio={profile.bio}
            joined={profile.created_at}
            followers={followers ?? 0}
            following={following ?? 0}
            location={profile.location}
            website={profile.website}
          />

          <div className="h-16" />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
