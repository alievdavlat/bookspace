"use client";

import { useRouter, useSearchParams } from "next/navigation";

const LABELS: Record<string, string> = { en: "English", uz: "Uzbek", ru: "Russian", pdf: "PDF", epub: "EPUB" };
const KEYS = ["genre", "lang", "format", "q"] as const;

export function ActiveFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const chips: { key: string; val: string; text: string }[] = [];
  for (const key of KEYS) {
    for (const val of sp.getAll(key)) {
      if (!val) continue;
      chips.push({ key, val, text: key === "q" ? `“${val}”` : LABELS[val] ?? val });
    }
  }
  if (chips.length === 0) return null;

  const remove = (key: string, val: string) => {
    const params = new URLSearchParams(sp.toString());
    const rest = params.getAll(key).filter((v) => v !== val);
    params.delete(key);
    rest.forEach((v) => params.append(key, v));
    const s = params.toString();
    router.replace(s ? `/explore?${s}` : "/explore", { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={`${c.key}-${c.val}`}
          onClick={() => remove(c.key, c.val)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm hover:border-primary"
        >
          {c.text}
          <span className="text-muted-foreground">✕</span>
        </button>
      ))}
      <button
        onClick={() => router.replace("/explore", { scroll: false })}
        className="px-2 text-sm text-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
