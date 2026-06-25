import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FocusBookCards } from "@/components/aceternity/focus-cards";
import { ExploreSidebar } from "@/components/explore/explore-sidebar";
import { ActiveFilters } from "@/components/explore/active-filters";
import { listGenreNames } from "@/lib/actions/genres";
import { languageName } from "@/lib/languages";
import type { BookWithAuthor } from "@/lib/types";

export const metadata: Metadata = { title: "Explore · Bookspace" };

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const genres = toArray(params.genre);
  const langs = toArray(params.lang);
  const formats = toArray(params.format);
  const types = toArray(params.type);
  const lengths = toArray(params.length);
  const sort = typeof params.sort === "string" ? params.sort : "new";

  const supabase = await createClient();
  let query = supabase
    .from("books")
    .select(
      "id, author_id, title, slug, author_name, description, cover_url, language, genres, type, format, status, visibility, page_count, views, created_at, author:profiles!books_author_id_fkey(username, display_name)"
    )
    .eq("status", "published")
    .eq("visibility", "public");

  if (q) query = query.ilike("title", `%${q}%`);
  if (genres.length) query = query.overlaps("genres", genres);
  if (langs.length) query = query.in("language", langs);
  if (formats.length) query = query.in("format", formats);
  if (types.length) query = query.in("type", types);
  if (lengths.length) {
    const conds: string[] = [];
    if (lengths.includes("short")) conds.push("page_count.lte.100");
    if (lengths.includes("medium")) conds.push("and(page_count.gt.100,page_count.lte.300)");
    if (lengths.includes("long")) conds.push("page_count.gt.300");
    if (conds.length) query = query.or(conds.join(","));
  }

  if (sort === "title") query = query.order("title", { ascending: true });
  else if (sort === "popular") query = query.order("views", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query;
  const books = (data ?? []) as unknown as BookWithAuthor[];
  const genreNames = await listGenreNames();

  // Languages present in the catalog (dynamic).
  const { data: langRows } = await supabase
    .from("books")
    .select("language")
    .eq("status", "published")
    .eq("visibility", "public");
  const presentLangs = Array.from(
    new Set((langRows ?? []).map((r) => (r as { language: string | null }).language).filter(Boolean) as string[])
  ).map((code) => ({ code, name: languageName(code) }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="font-serif text-4xl font-semibold">Explore</h1>
        <p className="mt-2 text-muted-foreground">
          {books.length} {books.length === 1 ? "book" : "books"} in the community library
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[250px_1fr]">
          {/* Filters */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading filters…</div>}>
              <ExploreSidebar genres={genreNames} languages={presentLangs} />
            </Suspense>
          </div>

          {/* Results */}
          <div>
            <Suspense fallback={null}>
              <ActiveFilters />
            </Suspense>

            {books.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
                <p className="font-serif text-2xl">No books match</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try clearing some filters — or upload the first book from your Studio.
                </p>
              </div>
            ) : (
              <FocusBookCards books={books} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
