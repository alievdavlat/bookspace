"use client";

import { useState } from "react";
import Link from "next/link";
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

type TabKey = "books" | "blog" | "about";

export function ProfileTabs({
  books,
  posts,
  bio,
  joined,
  followers,
  following,
}: {
  books: BookWithAuthor[];
  posts: ProfilePost[];
  bio: string | null;
  joined: string;
  followers: number;
  following: number;
}) {
  const [tab, setTab] = useState<TabKey>("books");

  const tabs: { k: TabKey; l: string }[] = [
    { k: "books", l: `Books · ${books.length}` },
    { k: "blog", l: `Blog · ${posts.length}` },
    { k: "about", l: "About" },
  ];

  return (
    <div className="mt-8">
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "relative px-4 py-2.5 text-sm transition-colors",
              tab === t.k ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.l}
            {tab === t.k ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "books" ? (
          books.length === 0 ? (
            <p className="text-muted-foreground">No published books yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )
        ) : null}

        {tab === "blog" ? (
          posts.length === 0 ? (
            <p className="text-muted-foreground">No blog posts yet.</p>
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

        {tab === "about" ? (
          <div className="max-w-2xl space-y-4">
            {bio ? (
              <p className="text-muted-foreground">{bio}</p>
            ) : (
              <p className="text-muted-foreground">This reader hasn&apos;t written a bio yet.</p>
            )}
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Stat label="Followers" value={followers} />
              <Stat label="Following" value={following} />
              <Stat label="Books" value={books.length} />
              <Stat label="Joined" value={new Date(joined).toLocaleDateString()} />
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-serif text-xl font-semibold text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
