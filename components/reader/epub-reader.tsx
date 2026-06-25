"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ePub from "epubjs";
import { createClient } from "@/lib/supabase/client";

type ThemeKey = "light" | "sepia" | "dark";
const THEMES: Record<ThemeKey, { bg: string; fg: string; page: string }> = {
  light: { bg: "#efe6d8", fg: "#2b2118", page: "#fffdf9" },
  sepia: { bg: "#e2d4b7", fg: "#3a2c18", page: "#f7edd8" },
  dark: { bg: "#15110d", fg: "#e9ddc9", page: "#221a12" },
};

type Loc = { start?: { cfi?: string; percentage?: number } };
type Rendition = {
  display: (target?: string) => Promise<unknown>;
  next: () => void;
  prev: () => void;
  on: (event: string, cb: (loc: Loc) => void) => void;
  themes: { override: (key: string, value: string) => void };
};
type EpubBook = {
  renderTo: (el: HTMLElement, opts: Record<string, unknown>) => Rendition;
  destroy: () => void;
};

export function EpubReader({
  epubUrl,
  bookId,
  userId,
  title,
  backSlug,
  startCfi,
}: {
  epubUrl: string;
  bookId: string;
  userId: string;
  title: string;
  backSlug: string;
  startCfi?: string;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [theme, setTheme] = useState<ThemeKey>("sepia");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!viewerRef.current) return;
    const book = ePub(epubUrl) as unknown as EpubBook;
    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      spread: "auto",
      flow: "paginated",
    });
    renditionRef.current = rendition;
    rendition.display(startCfi || undefined).then(() => setReady(true));

    rendition.on("relocated", (loc: Loc) => {
      const cfi = loc?.start?.cfi;
      if (cfi && userId) {
        const supabase = createClient();
        void supabase.from("reading_progress").upsert({
          user_id: userId,
          book_id: bookId,
          position: cfi,
          percent: Math.round((loc?.start?.percentage ?? 0) * 100),
          last_read_at: new Date().toISOString(),
        });
      }
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") rendition.next();
      if (e.key === "ArrowLeft") rendition.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      try {
        book.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [epubUrl, bookId, userId, startCfi]);

  useEffect(() => {
    const r = renditionRef.current;
    if (!r || !ready) return;
    r.themes.override("color", THEMES[theme].fg);
    r.themes.override("background", THEMES[theme].page);
  }, [theme, ready]);

  const t = THEMES[theme];

  return (
    <div className="flex h-screen flex-col" style={{ background: t.bg, color: t.fg }}>
      <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
        <Link href={`/book/${backSlug}`} className="opacity-80 hover:opacity-100">
          ← Back
        </Link>
        <span className="line-clamp-1 font-serif text-base">{title}</span>
        <div className="flex items-center gap-2">
          {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTheme(k)}
              aria-label={`${k} theme`}
              className={`size-5 rounded-full border ${theme === k ? "ring-2 ring-primary" : ""}`}
              style={{ background: THEMES[k].page, borderColor: "rgba(0,0,0,.2)" }}
            />
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {!ready ? (
          <div className="absolute inset-0 grid place-items-center">
            <p className="font-serif text-xl opacity-70">Opening book…</p>
          </div>
        ) : null}
        <div ref={viewerRef} className="mx-auto h-full max-w-3xl px-4" />
      </div>

      <div className="flex items-center justify-center gap-6 px-5 py-4 text-sm">
        <button onClick={() => renditionRef.current?.prev()} className="rounded-md px-3 py-1 opacity-80 hover:opacity-100">
          ‹ Prev
        </button>
        <button onClick={() => renditionRef.current?.next()} className="rounded-md px-3 py-1 opacity-80 hover:opacity-100">
          Next ›
        </button>
      </div>
    </div>
  );
}
