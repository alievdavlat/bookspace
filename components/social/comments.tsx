"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/social/like-button";
import { addComment, deleteComment } from "@/lib/actions/social";
import type { CommentNode } from "@/lib/comments";

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
  comments: CommentNode[];
  currentUserId: string | null;
}) {
  const roots = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-semibold">
        Comments <span className="text-muted-foreground">· {comments.length}</span>
      </h2>

      {currentUserId ? (
        <CommentForm targetType={targetType} targetId={targetId} path={path} />
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {roots.length === 0 ? (
          <li className="text-sm text-muted-foreground">No comments yet.</li>
        ) : (
          roots.map((c) => (
            <li key={c.id}>
              <CommentRow
                c={c}
                targetType={targetType}
                targetId={targetId}
                path={path}
                currentUserId={currentUserId}
              />
              {repliesOf(c.id).length > 0 ? (
                <ul className="mt-4 space-y-4 border-l border-border pl-4">
                  {repliesOf(c.id).map((r) => (
                    <li key={r.id}>
                      <CommentRow
                        c={r}
                        targetType={targetType}
                        targetId={targetId}
                        path={path}
                        currentUserId={currentUserId}
                        isReply
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function CommentForm({
  targetType,
  targetId,
  path,
  parentId,
  onDone,
  compact,
}: {
  targetType: string;
  targetId: string;
  path: string;
  parentId?: string;
  onDone?: () => void;
  compact?: boolean;
}) {
  return (
    <form action={addComment} onSubmit={onDone} className={compact ? "mt-3 flex flex-col gap-2" : "mt-5 flex flex-col gap-2"}>
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />
      <input type="hidden" name="path" value={path} />
      {parentId ? <input type="hidden" name="parent_id" value={parentId} /> : null}
      <textarea name="body" required rows={compact ? 2 : 3} placeholder={parentId ? "Write a reply…" : "Add a comment…"} className={fieldClass} />
      <Button type="submit" size="sm" className="self-start">
        {parentId ? "Reply" : "Comment"}
      </Button>
    </form>
  );
}

function CommentRow({
  c,
  targetType,
  targetId,
  path,
  currentUserId,
  isReply,
}: {
  c: CommentNode;
  targetType: "book" | "blog" | "review";
  targetId: string;
  path: string;
  currentUserId: string | null;
  isReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const name = c.user?.display_name || c.user?.username || "Reader";
  return (
    <div className="flex gap-3">
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
          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{c.body}</p>

        <div className="mt-2 flex items-center gap-3">
          <LikeButton targetType="comment" targetId={c.id} initialLiked={c.liked} initialCount={c.likeCount} canLike={!!currentUserId} />
          {currentUserId && !isReply ? (
            <button onClick={() => setReplying((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground">
              Reply
            </button>
          ) : null}
          {currentUserId === c.user_id ? (
            <form action={deleteComment}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="path" value={path} />
              <button className="text-xs text-destructive hover:underline">Delete</button>
            </form>
          ) : null}
        </div>

        {replying ? (
          <CommentForm
            targetType={targetType}
            targetId={targetId}
            path={path}
            parentId={c.id}
            compact
            onDone={() => setReplying(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
