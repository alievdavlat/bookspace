"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addComment, deleteComment } from "@/lib/actions/social";

export type CommentItem = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  user: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function Comments({
  targetType,
  targetId,
  path,
  comments,
  currentUserId,
}: {
  targetType: "book" | "blog" | "review";
  targetId: string;
  path: string;
  comments: CommentItem[];
  currentUserId: string | null;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-semibold">
        Comments <span className="text-muted-foreground">· {comments.length}</span>
      </h2>

      {currentUserId ? (
        <form action={addComment} className="mt-5 flex flex-col gap-2">
          <input type="hidden" name="target_type" value={targetType} />
          <input type="hidden" name="target_id" value={targetId} />
          <input type="hidden" name="path" value={path} />
          <textarea name="body" required rows={3} placeholder="Add a comment…" className={fieldClass} />
          <Button type="submit" size="sm" className="self-start">
            Comment
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {comments.length === 0 ? (
          <li className="text-sm text-muted-foreground">No comments yet.</li>
        ) : (
          comments.map((c) => {
            const name = c.user?.display_name || c.user?.username || "Reader";
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  {c.user?.avatar_url ? <AvatarImage src={c.user.avatar_url} alt={name} /> : null}
                  <AvatarFallback className="text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    {c.user?.username ? (
                      <Link href={`/author/${c.user.username}`} className="font-medium hover:text-primary">
                        {name}
                      </Link>
                    ) : (
                      <span className="font-medium">{name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{c.body}</p>
                  {currentUserId === c.user_id ? (
                    <form action={deleteComment} className="mt-1">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="path" value={path} />
                      <button className="text-xs text-destructive hover:underline">Delete</button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
