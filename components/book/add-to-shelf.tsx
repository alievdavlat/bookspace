"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { addToShelf, type ActionState } from "@/lib/actions/community";

const initial: ActionState = {};
const SHELVES = ["Want to read", "Reading", "Read"];

export function AddToShelf({ bookId }: { bookId: string }) {
  const [state, formAction, pending] = useActionState(addToShelf, initial);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SHELVES.map((s) => (
          <form key={s} action={formAction}>
            <input type="hidden" name="book_id" value={bookId} />
            <input type="hidden" name="shelf" value={s} />
            <Button type="submit" variant="outline" size="sm" disabled={pending}>
              + {s}
            </Button>
          </form>
        ))}
      </div>
      {state.ok && <p className="mt-2 text-sm text-green">Added to your shelf.</p>}
      {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
