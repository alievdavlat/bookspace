"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { addReview, type ActionState } from "@/lib/actions/community";

export type ReviewItem = {
  rating: number;
  body: string | null;
  created_at: string;
  user: { username: string | null; display_name: string | null } | null;
};

const initial: ActionState = {};

function Stars({ value }: { value: number }) {
  return (
    <span className="text-gold" aria-label={`${value} of 5`}>
      {"★".repeat(value)}
      <span className="text-muted-foreground">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function ReviewSection({
  bookId,
  slug,
  reviews,
  avg,
  canReview,
}: {
  bookId: string;
  slug: string;
  reviews: ReviewItem[];
  avg: number | null;
  canReview: boolean;
}) {
  const [state, formAction, pending] = useActionState(addReview, initial);
  const [rating, setRating] = useState(0);

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-2xl font-semibold">Reviews</h2>
        {avg ? (
          <span className="text-sm text-muted-foreground">
            <Stars value={Math.round(avg)} /> {avg.toFixed(1)} ({reviews.length})
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">No reviews yet</span>
        )}
      </div>

      {canReview ? (
        <form action={formAction} className="mt-5 max-w-xl rounded-xl border border-border bg-card p-5">
          <input type="hidden" name="book_id" value={bookId} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="rating" value={rating} />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
                className={`text-2xl ${n <= rating ? "text-gold" : "text-muted-foreground"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            name="body"
            rows={3}
            placeholder="Share your thoughts…"
            className="mt-3 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
          {state.ok && <p className="mt-2 text-sm text-green">Thanks for your review!</p>}
          <Button type="submit" disabled={pending} className="mt-3" size="sm">
            {pending ? "Saving…" : "Post review"}
          </Button>
        </form>
      ) : null}

      <ul className="mt-6 space-y-5">
        {reviews.map((r, i) => (
          <li key={i} className="border-b border-border pb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{r.user?.display_name || r.user?.username || "Reader"}</span>
              <Stars value={r.rating} />
            </div>
            {r.body ? <p className="mt-1 text-sm text-muted-foreground">{r.body}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
