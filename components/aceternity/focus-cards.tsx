"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BookWithAuthor } from "@/lib/types";

/** Aceternity-style focus cards: hovering one card sharpens it and dims/blurs the rest. */
export function FocusBookCards({ books }: { books: BookWithAuthor[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((b, i) => {
        const author = b.author_name || b.author?.display_name || b.author?.username || "Unknown";
        return (
          <Link
            key={b.id}
            href={`/book/${b.slug}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "group relative block overflow-hidden rounded-xl border border-border bg-secondary shadow-sm transition-all duration-300 ease-out",
              hovered !== null && hovered !== i && "scale-[0.97] opacity-60 blur-[2px]"
            )}
          >
            <div className="aspect-[2/3]">
              {b.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.cover_url} alt={b.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center font-serif text-lg">
                  {b.title}
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="line-clamp-2 font-medium text-white">{b.title}</p>
              <p className="line-clamp-1 text-xs text-white/70">{author}</p>
              {b.genres?.[0] ? <p className="mt-1 text-[10px] uppercase tracking-wide text-primary-foreground/80">{b.genres[0]}</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
