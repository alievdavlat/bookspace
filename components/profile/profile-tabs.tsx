"use client";

import { useState } from "react";
import Link from "next/link";
import { ListMusic, MapPin, Link2, CalendarDays } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { cn } from "@/lib/utils";
import type { BookWithAuthor } from "@/lib/types";

export type ProfilePost = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  created_at: string;
};
export type ProfileSection = { id: string; title: string; body: string | null };
export type ProfilePlaylist = { id: string; title: string; description: string | null; count: number };

export function ProfileTabs({
  books,
  posts,
  playlists,
  aboutSections,
  customTabs,
  bio,
  joined,
  followers,
  following,
  location,
  website,
}: {
  books: BookWithAuthor[];
  posts: ProfilePost[];
  playlists: ProfilePlaylist[];
  aboutSections: ProfileSection[];
  customTabs: ProfileSection[];
  bio: string | null;
  joined: string;
  followers: number;
  following: number;
  location: string | null;
  website: string | null;
}) {
  const baseTabs = [
    { k: "books", l: `Books · ${books.length}` },
    { k: "blog", l: `Blog · ${posts.length}` },
    { k: "playlists", l: `Playlists · ${playlists.length}` },
    ...customTabs.map((t) => ({ k: `tab-${t.id}`, l: t.title })),
    { k: "about", l: "About" },
  ];
  const [tab, setTab] = useState(baseTabs[0].k);

  return (
    <div className="mt-8">
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {baseTabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "relative whitespace-nowrap px-4 py-2.5 text-sm transition-colors",
              tab === t.k ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.l}
            {tab === t.k ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" /> : null}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "books" ? (
          books.length === 0 ? (
            <Empty>No published books yet.</Empty>
          ) : (
            <Grid>
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </Grid>
          )
        ) : null}

        {tab === "blog" ? (
          posts.length === 0 ? (
            <Empty>No blog posts yet.</Empty>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {posts.map((p) => (
                <li key={p.id} className="p-4">
                  <Link href={`/blog/${p.slug}`} className="font-medium hover:text-primary">
                    {p.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(p.published_at || p.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "playlists" ? (
          playlists.length === 0 ? (
            <Empty>No playlists yet.</Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((p) => (
                <Link
                  key={p.id}
                  href={`/playlist/${p.id}`}
                  className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <ListMusic className="size-5 text-primary" />
                  <p className="mt-3 font-medium group-hover:text-primary">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.count} books</p>
                  {p.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          )
        ) : null}

        {customTabs.map((t) =>
          tab === `tab-${t.id}` ? (
            <div key={t.id} className="max-w-2xl whitespace-pre-line text-muted-foreground">
              {t.body || "Nothing here yet."}
            </div>
          ) : null
        )}

        {tab === "about" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Main column — intro + LinkedIn-style sections */}
            <div className="space-y-6">
              {bio ? (
                <section className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-serif text-lg font-semibold">Intro</h3>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{bio}</p>
                </section>
              ) : null}

              {aboutSections.map((s) => (
                <section key={s.id} className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-serif text-lg font-semibold">{s.title}</h3>
                  {s.body ? (
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{s.body}</p>
                  ) : null}
                </section>
              ))}

              {!bio && aboutSections.length === 0 ? (
                <p className="text-muted-foreground">This reader hasn&apos;t written an about yet.</p>
              ) : null}
            </div>

            {/* Side column — YouTube/IG-style details + stats */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-serif text-lg font-semibold">Details</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                  {location ? (
                    <li className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-primary" /> {location}
                    </li>
                  ) : null}
                  {website ? (
                    <li className="flex items-center gap-2">
                      <Link2 className="size-4 shrink-0 text-primary" />
                      <a href={website} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
                        {website.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  ) : null}
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-primary" /> Joined {new Date(joined).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </li>
                </ul>
              </section>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Followers" value={followers} />
                <Stat label="Following" value={following} />
                <Stat label="Books" value={books.length} />
                <Stat label="Playlists" value={playlists.length} />
              </dl>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-serif text-xl font-semibold text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
