"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BookMarked } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setShelf } from "@/lib/actions/community";

const SHELVES = ["Want to read", "Reading", "Read"];

export function AddToShelf({
  bookId,
  currentShelf,
}: {
  bookId: string;
  currentShelf: string | null;
}) {
  const [shelf, setShelfState] = useState(currentShelf ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={shelf}
      onValueChange={(v) => {
        if (!v) return;
        setShelfState(v);
        startTransition(async () => {
          await setShelf(bookId, v);
          toast.success(`Moved to “${v}”`);
        });
      }}
    >
      <SelectTrigger className="w-44" disabled={pending}>
        <span className="flex items-center gap-1.5">
          <BookMarked className="size-4" />
          <SelectValue placeholder="Add to shelf">{(v: string) => v || "Add to shelf"}</SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        {SHELVES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
