"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GENRES } from "@/lib/types";
import { Input } from "@/components/ui/input";

const LANGUAGES = [
  { v: "en", l: "English" },
  { v: "uz", l: "Uzbek" },
  { v: "ru", l: "Russian" },
];
const FORMATS = [
  { v: "pdf", l: "PDF" },
  { v: "epub", l: "EPUB" },
];
const SORTS = [
  { v: "new", l: "Newest" },
  { v: "title", l: "Title A–Z" },
  { v: "popular", l: "Most read" },
];

export function ExploreSidebar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  const push = (params: URLSearchParams) => {
    const s = params.toString();
    router.replace(s ? `/explore?${s}` : "/explore", { scroll: false });
  };

  const toggle = (key: string, val: string) => {
    const params = new URLSearchParams(sp.toString());
    const cur = params.getAll(key);
    params.delete(key);
    (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]).forEach((v) =>
      params.append(key, v)
    );
    push(params);
  };

  const setSingle = (key: string, val: string) => {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    push(params);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSingle("q", q.trim());
  };

  const checked = (key: string, val: string) => sp.getAll(key).includes(val);

  return (
    <aside className="space-y-7">
      <form onSubmit={submitSearch}>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles…"
          aria-label="Search titles"
        />
      </form>

      <Group title="Sort by">
        <select
          value={sp.get("sort") ?? "new"}
          onChange={(e) => setSingle("sort", e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {SORTS.map((s) => (
            <option key={s.v} value={s.v}>
              {s.l}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Genre">
        {GENRES.map((g) => (
          <Check key={g} label={g} on={checked("genre", g)} onClick={() => toggle("genre", g)} />
        ))}
      </Group>

      <Group title="Language">
        {LANGUAGES.map((l) => (
          <Check key={l.v} label={l.l} on={checked("lang", l.v)} onClick={() => toggle("lang", l.v)} />
        ))}
      </Group>

      <Group title="Format">
        {FORMATS.map((f) => (
          <Check key={f.v} label={f.l} on={checked("format", f.v)} onClick={() => toggle("format", f.v)} />
        ))}
      </Group>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
      <input type="checkbox" checked={on} onChange={onClick} className="accent-primary" />
      {label}
    </label>
  );
}
