"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

type Result = {
  kind: "book" | "person" | "blog";
  id: string;
  title: string;
  href: string;
  sub: string | null;
  cover: string | null;
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-1/4 max-w-xl translate-y-0 overflow-hidden rounded-2xl p-0"
        >
          <DialogTitle className="sr-only">Search Bookspace</DialogTitle>
          <Command shouldFilter={false}>
            <CommandInput value={q} onValueChange={setQ} placeholder="Search books, people, posts…" />
            <CommandList>
          {q.trim().length < 2 ? (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          ) : results.length === 0 ? (
            <CommandEmpty>{loading ? "Searching…" : `No results for “${q}”.`}</CommandEmpty>
          ) : (
            groups.map((g) => {
              const items = results.filter((r) => r.kind === g.kind);
              if (!items.length) return null;
              return (
                <CommandGroup key={g.kind} heading={g.label}>
                  {items.map((r) => (
                    <CommandItem key={r.id} value={`${r.kind}-${r.id}`} onSelect={() => go(r.href)}>
                      {r.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.cover} alt="" className="size-7 shrink-0 rounded object-cover" />
                      ) : (
                        <span className="grid size-7 shrink-0 place-items-center rounded bg-secondary text-xs">
                          {g.label[0]}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{r.title}</span>
                        {r.sub ? <span className="block truncate text-xs text-muted-foreground">{r.sub}</span> : null}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
              })
            )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
