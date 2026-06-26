"use client";

import { useEffect, useRef, useState } from "react";
import { FocusBookCards } from "@/components/aceternity/focus-cards";
import type { BookWithAuthor } from "@/lib/types";

/** How many cards to show first, and how many to add per scroll step. */
const PAGE = 50;
const STEP = 25;

/**
 * Windowed grid: renders only a slice of the catalog so the DOM stays light.
 * Scrolling near the bottom grows the window; returning to the top trims it
 * back to the first page so you never have to scroll past thousands of cards.
 */
export function ExploreResults({ books }: { books: BookWithAuthor[] }) {
  const [count, setCount] = useState(PAGE);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // New filter/search result set → start from the first page again.
  useEffect(() => {
    setCount(PAGE);
  }, [books]);

  // Grow the window as the bottom sentinel approaches the viewport.
  // Gate on a real downward scroll so the first paint (when the sentinel
  // briefly sits at the top, pre-layout) can't over-fill past PAGE.
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && window.scrollY > 50) {
          setCount((c) => Math.min(c + STEP, books.length));
        }
      },
      // Small preload margin: start at ~PAGE, grow as you near the end.
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [books.length]);

  // Trim back to the first page once the user is back at the top.
  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCount(PAGE);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const visible = books.slice(0, count);

  return (
    <div>
      <div ref={topRef} aria-hidden className="h-px w-full" />

      <FocusBookCards books={visible} />

      {count < books.length ? (
        <div
          ref={bottomRef}
          className="flex justify-center py-10 text-sm text-muted-foreground"
        >
          Showing {visible.length} of {books.length} — scroll for more
        </div>
      ) : books.length > PAGE ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          That’s all {books.length} books
        </p>
      ) : null}
    </div>
  );
}
