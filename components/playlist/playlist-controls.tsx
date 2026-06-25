"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePlaylist, addToPlaylist } from "@/lib/actions/playlists";

export function DeletePlaylistButton({
  playlistId,
  redirectTo,
}: {
  playlistId: string;
  redirectTo: string;
}) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        toast("Delete this playlist?", {
          action: {
            label: "Delete",
            onClick: async () => {
              const fd = new FormData();
              fd.set("id", playlistId);
              await deletePlaylist(fd);
              router.push(redirectTo);
            },
          },
        })
      }
    >
      <Trash2 className="size-4" /> Delete playlist
    </Button>
  );
}

export function RemoveFromPlaylistButton({
  playlistId,
  bookId,
}: {
  playlistId: string;
  bookId: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const fd = new FormData();
        fd.set("playlist_id", playlistId);
        fd.set("book_id", bookId);
        await addToPlaylist(fd); // toggle → removes existing
        router.refresh();
      }}
      className="mt-2 text-xs text-destructive hover:underline"
    >
      Remove
    </button>
  );
}
