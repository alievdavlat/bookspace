"use client";

import { toggleFollow } from "@/lib/actions/community";
import { Button } from "@/components/ui/button";

export function FollowButton({
  targetId,
  username,
  isFollowing,
}: {
  targetId: string;
  username: string;
  isFollowing: boolean;
}) {
  return (
    <form action={toggleFollow}>
      <input type="hidden" name="target_id" value={targetId} />
      <input type="hidden" name="username" value={username} />
      <Button type="submit" variant={isFollowing ? "outline" : "default"} size="sm">
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </form>
  );
}
