"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FORMATS = [
  { v: "pdf", l: "PDF" },
  { v: "epub", l: "EPUB" },
  { v: "written", l: "Written" },
];
const TYPES = [
  { v: "uploaded", l: "Uploaded" },
  { v: "written", l: "Written online" },
];
const LENGTHS = [
  { v: "short", l: "Short (≤100p)" },
  { v: "medium", l: "Medium (100–300p)" },
  { v: "long", l: "Long (300p+)" },
];
const SORTS = [
  { v: "new", l: "Newest" },
  { v: "oldest", l: "Oldest" },
  { v: "title", l: "Title A–Z" },
  { v: "popular", l: "Most read" },
];

export function ExploreSidebar({
  genres,
  languages,
}: {
  genres: string[];
  languages: { code: string; name: string }[];
}) {
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
        <Select value={sp.get("sort") ?? "new"} onValueChange={(v) => setSingle("sort", String(v))}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => SORTS.find((s) => s.v === value)?.l ?? "Newest"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.v} value={s.v}>
                {s.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Group>

      <Group title="Genre">
        {genres.map((g) => (
          <Check key={g} label={g} on={checked("genre", g)} onToggle={() => toggle("genre", g)} />
        ))}
      </Group>

      <Group title="Type">
        {TYPES.map((t) => (
          <Check key={t.v} label={t.l} on={checked("type", t.v)} onToggle={() => toggle("type", t.v)} />
        ))}
      </Group>

      <Group title="Length">
        {LENGTHS.map((l) => (
          <Check key={l.v} label={l.l} on={checked("length", l.v)} onToggle={() => toggle("length", l.v)} />
        ))}
      </Group>

      {languages.length > 0 ? (
        <Group title="Language">
          {languages.map((l) => (
            <Check key={l.code} label={l.name} on={checked("lang", l.code)} onToggle={() => toggle("lang", l.code)} />
          ))}
        </Group>
      ) : null}

      <Group title="Format">
        {FORMATS.map((f) => (
          <Check key={f.v} label={f.l} on={checked("format", f.v)} onToggle={() => toggle("format", f.v)} />
        ))}
      </Group>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Check({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground">
      <Checkbox checked={on} onCheckedChange={onToggle} />
      {label}
    </label>
  );
}
