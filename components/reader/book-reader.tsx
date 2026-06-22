"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
// @ts-expect-error - react-pageflip ships loose types
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import { createClient } from "@/lib/supabase/client";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type ThemeKey = "light" | "sepia" | "dark";
const THEMES: Record<ThemeKey, { bg: string; fg: string; page: string }> = {
  light: { bg: "#efe6d8", fg: "#2b2118", page: "#fffdf9" },
  sepia: { bg: "#e2d4b7", fg: "#3a2c18", page: "#f7edd8" },
  dark: { bg: "#15110d", fg: "#e9ddc9", page: "#221a12" },
};

export function BookReader({
  pdfUrl,
  bookId,
  userId,
  title,
  backSlug,
  startPage = 0,
}: {
  pdfUrl: string;
  bookId: string;
  userId: string;
  title: string;
  backSlug: string;
  startPage?: number;
}) {
  const [pages, setPages] = useState<(string | null)[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  const [theme, setTheme] = useState<ThemeKey>("sepia");
  const [current, setCurrent] = useState(startPage);
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) return;
        const total = pdf.numPages;
        setNumPages(total);
        setPages(new Array(total).fill(null));

        for (let i = 1; i <= total; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const url = canvas.toDataURL("image/jpeg", 0.8);
          if (cancelled) return;
          setPages((prev) => {
            const copy = prev.slice();
            copy[i - 1] = url;
            return copy;
          });
          setPct(Math.round((i / total) * 100));
          if (i >= Math.min(4, total)) setLoading(false);
          // Yield to keep the UI responsive while the rest stream in.
          await new Promise((r) => setTimeout(r, 16));
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  const saveProgress = useCallback(
    async (page: number) => {
      if (!userId || numPages === 0) return;
      const supabase = createClient();
      await supabase.from("reading_progress").upsert({
        user_id: userId,
        book_id: bookId,
        position: String(page),
        percent: Math.round((page / numPages) * 100),
        last_read_at: new Date().toISOString(),
      });
    },
    [userId, bookId, numPages]
  );

  const t = THEMES[theme];

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ background: t.bg, color: t.fg }}>
        <p className="font-serif text-2xl">Preparing your book…</p>
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm opacity-70">{pct}%</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: t.bg, color: t.fg }}>
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

      <div className="flex flex-1 items-center justify-center px-2 py-2">
        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={588}
          size="stretch"
          minWidth={300}
          maxWidth={560}
          minHeight={420}
          maxHeight={780}
          maxShadowOpacity={0.5}
          showCover
          mobileScrollSupport
          startPage={startPage}
          className=""
          style={{}}
          onFlip={(e: { data: number }) => {
            setCurrent(e.data);
            void saveProgress(e.data);
          }}
        >
          {Array.from({ length: numPages }).map((_, i) => (
            <div key={i} className="flex items-center justify-center overflow-hidden" style={{ background: t.page }}>
              {pages[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pages[i] as string} alt={`Page ${i + 1}`} className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs opacity-40">Page {i + 1}</span>
              )}
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flex items-center justify-center gap-6 px-5 py-4 text-sm">
        <button onClick={() => bookRef.current?.pageFlip().flipPrev()} className="rounded-md px-3 py-1 opacity-80 hover:opacity-100">
          ‹ Prev
        </button>
        <span className="tabular-nums opacity-70">
          {current + 1} / {numPages}
        </span>
        <button onClick={() => bookRef.current?.pageFlip().flipNext()} className="rounded-md px-3 py-1 opacity-80 hover:opacity-100">
          Next ›
        </button>
      </div>
    </div>
  );
}
