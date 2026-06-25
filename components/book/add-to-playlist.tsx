"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToPlaylist, createPlaylistWithBook } from "@/lib/actions/playlists";

export function AddToPlaylist({
  bookId,
  playlists,
}: {
  bookId: string;
  playlists: { id: string; title: string; has: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative inline-block">
      <Button variant="outline" size="lg" onClick={() => setOpen((v) => !v)}>
        <ListPlus className="size-4" /> Save to playlist
      </Button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-xl">
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your playlists
            </p>
            <div className="max-h-56 overflow-y-auto">
              {playlists.length ? (
                playlists.map((p) => (
                  <form
                    key={p.id}
                    action={async (fd) => {
                      await addToPlaylist(fd);
                      router.refresh();
                    }}
                  >
                    <input type="hidden" name="playlist_id" value={p.id} />
                    <input type="hidden" name="book_id" value={bookId} />
                    <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary">
                      <span className="truncate">{p.title}</span>
                      {p.has ? <Check className="size-4 text-primary" /> : null}
                    </button>
                  </form>
                ))
              ) : (
                <p className="px-2 py-2 text-xs text-muted-foreground">No playlists yet.</p>
              )}
            </div>
            <div className="my-1.5 border-t border-border" />
            <form
              action={async (fd) => {
                await createPlaylistWithBook(fd);
                setOpen(false);
                router.refresh();
              }}
              className="flex items-center gap-1 px-1"
            >
              <input type="hidden" name="book_id" value={bookId} />
              <input
                name="title"
                required
                placeholder="New playlist…"
                className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-ring"
              />
              <button className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10">
                Add
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
