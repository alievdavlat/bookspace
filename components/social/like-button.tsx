"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/lib/actions/social";

export function LikeButton({
  targetType,
  targetId,
  initialLiked,
  initialCount,
  canLike,
}: {
  targetType: "book" | "blog" | "comment" | "review";
  targetId: string;
  initialLiked: boolean;
  initialCount: number;
  canLike: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const onClick = async () => {
    if (!canLike) {
      toast("Sign in to like.");
      return;
    }
    setLiked((v) => !v);
    setCount((c) => c + (liked ? -1 : 1));
    const fd = new FormData();
    fd.set("target_type", targetType);
    fd.set("target_id", targetId);
    await toggleLike(fd);
  };

  return (
    <button
      onClick={onClick}
      aria-pressed={liked}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        liked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count}
    </button>
  );
}
