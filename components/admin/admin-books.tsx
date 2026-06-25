"use client";

import { useState } from "react";
import Link from "next/link";
import { Table2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { setBookStatus, deleteBook } from "@/lib/actions/admin";

export type AdminBook = {
  id: string;
  title: string;
  slug: string;
  author_name: string | null;
  cover_url: string | null;
  type: string;
  status: string;
  visibility: string;
  views: number | null;
  created_at: string;
};

export function AdminBooks({ books }: { books: AdminBook[] }) {
  const [view, setView] = useState<"table" | "gallery">("table");

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{books.length} books</p>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <ToggleBtn active={view === "table"} onClick={() => setView("table")} label="Table">
            <Table2 className="size-4" />
          </ToggleBtn>
          <ToggleBtn active={view === "gallery"} onClick={() => setView("gallery")} label="Gallery">
            <LayoutGrid className="size-4" />
          </ToggleBtn>
        </div>
      </div>

      {books.length === 0 ? (
        <p className="text-muted-foreground">No books yet.</p>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link href={`/book/${b.slug}`} className="font-medium hover:text-primary">
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.author_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{b.views ?? 0}</td>
                  <td className="px-4 py-3">
                    <RowActions book={b} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <div key={b.id}>
              <Link href={`/book/${b.slug}`} className="group block">
                <div className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-secondary">
                  {b.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_url} alt={b.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-3 text-center font-serif text-sm">
                      {b.title}
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium group-hover:text-primary">{b.title}</p>
              </Link>
              <div className="mt-1 flex items-center justify-between">
                <StatusBadge status={b.status} />
                <RowActions book={b} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "bg-primary/15 text-primary"
      : status === "archived"
        ? "bg-muted text-muted-foreground"
        : "bg-gold/15 text-gold";
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone)}>{status}</span>;
}

function RowActions({ book, compact }: { book: AdminBook; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <form action={setBookStatus}>
        <input type="hidden" name="id" value={book.id} />
        <input type="hidden" name="status" value={book.status === "published" ? "draft" : "published"} />
        <button className="text-xs text-primary hover:underline">
          {book.status === "published" ? "Unpublish" : "Publish"}
        </button>
      </form>
      {!compact ? <span className="text-border">·</span> : null}
      <form action={deleteBook}>
        <input type="hidden" name="id" value={book.id} />
        <button className="text-xs text-destructive hover:underline">Delete</button>
      </form>
    </div>
  );
}
