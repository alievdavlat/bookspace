"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Result =
  | { kind: "book"; id: string; title: string; href: string; sub: string | null; cover: string | null }
  | { kind: "person"; id: string; title: string; href: string; sub: string | null; cover: string | null }
  | { kind: "blog"; id: string; title: string; href: string; sub: string | null; cover: string | null };

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K to open, Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else {
      setQ("");
      setResults([]);
    }
  }, [open]);

  const runSearch = useCallback(async (term: string) => {
    const t = term.trim();
    if (t.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const like = `%${t}%`;
    const [books, people, blogs] = await Promise.all([
      supabase
        .from("books")
        .select("id, title, slug, author_name, cover_url")
        .eq("status", "published")
        .eq("visibility", "public")
        .ilike("title", like)
        .limit(5),
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.${like},display_name.ilike.${like}`)
        .limit(5),
      supabase
        .from("blog_posts")
        .select("id, title, slug")
        .eq("status", "published")
        .ilike("title", like)
        .limit(5),
    ]);

    const out: Result[] = [];
    for (const b of books.data ?? [])
      out.push({ kind: "book", id: b.id, title: b.title, href: `/book/${b.slug}`, sub: b.author_name, cover: b.cover_url });
    for (const p of people.data ?? [])
      out.push({
        kind: "person",
        id: p.id,
        title: p.display_name || p.username || "Reader",
        href: `/author/${p.username}`,
        sub: p.username ? `@${p.username}` : null,
        cover: p.avatar_url,
      });
    for (const b of blogs.data ?? [])
      out.push({ kind: "blog", id: b.id, title: b.title, href: `/blog/${b.slug}`, sub: "Blog post", cover: null });

    setResults(out);
    setLoading(false);
  }, []);

  useEffect(() => {
    const h = setTimeout(() => runSearch(q), 200);
    return () => clearTimeout(h);
  }, [q, runSearch]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const groups: { label: string; kind: Result["kind"] }[] = [
    { label: "Books", kind: "book" },
    { label: "People", kind: "person" },
    { label: "Blog", kind: "blog" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-border px-1 text-[10px] sm:inline">⌘K</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search books, people, posts…"
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {q.trim().length < 2 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search.
                </p>
              ) : loading && results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">Searching…</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{q}”.</p>
              ) : (
                groups.map((g) => {
                  const items = results.filter((r) => r.kind === g.kind);
                  if (!items.length) return null;
                  return (
                    <div key={g.kind} className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {g.label}
                      </p>
                      {items.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => go(r.href)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-secondary"
                        >
                          {r.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.cover} alt="" className="size-8 shrink-0 rounded object-cover" />
                          ) : (
                            <span className="grid size-8 shrink-0 place-items-center rounded bg-secondary text-xs">
                              {g.label[0]}
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm">{r.title}</span>
                            {r.sub ? (
                              <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                            ) : null}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
