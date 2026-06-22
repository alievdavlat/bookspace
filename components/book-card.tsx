import Link from "next/link";
import type { BookWithAuthor } from "@/lib/types";

export function BookCard({ book }: { book: BookWithAuthor }) {
  const author =
    book.author?.display_name || book.author?.username || "Unknown";
  return (
    <Link href={`/book/${book.slug}`} className="group block">
      <div className="bs-cover aspect-[2/3] overflow-hidden rounded-lg border border-border bg-secondary shadow-sm">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-gold/20 p-4 text-center font-serif text-lg">
            {book.title}
          </div>
        )}
      </div>
      <h3 className="mt-3 line-clamp-1 font-medium group-hover:text-primary">
        {book.title}
      </h3>
      <p className="line-clamp-1 text-sm text-muted-foreground">{author}</p>
      {book.genres?.length ? (
        <p className="mt-1 text-xs text-muted-foreground">{book.genres[0]}</p>
      ) : null}
    </Link>
  );
}
