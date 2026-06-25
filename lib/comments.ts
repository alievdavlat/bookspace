import type { createClient } from "@/lib/supabase/server";

type DB = Awaited<ReturnType<typeof createClient>>;

export type CommentNode = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  parentId: string | null;
  likeCount: number;
  liked: boolean;
  user: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

export async function loadComments(
  supabase: DB,
  targetType: "book" | "blog" | "review",
  targetId: string,
  userId: string | null
): Promise<CommentNode[]> {
  const { data: rows } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, parent_id, user:profiles!comments_user_id_fkey(username, display_name, avatar_url)")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });

  const ids = (rows ?? []).map((r) => (r as { id: string }).id);

  const likeMap = new Map<string, number>();
  const liked = new Set<string>();
  if (ids.length) {
    const { data: cl } = await supabase
      .from("likes")
      .select("target_id, user_id")
      .eq("target_type", "comment")
      .in("target_id", ids);
    for (const l of (cl ?? []) as { target_id: string; user_id: string }[]) {
      likeMap.set(l.target_id, (likeMap.get(l.target_id) ?? 0) + 1);
      if (userId && l.user_id === userId) liked.add(l.target_id);
    }
  }

  return (rows ?? []).map((r) => {
    const row = r as unknown as {
      id: string;
      body: string;
      created_at: string;
      user_id: string;
      parent_id: string | null;
      user: CommentNode["user"];
    };
    return {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      user_id: row.user_id,
      parentId: row.parent_id,
      user: row.user,
      likeCount: likeMap.get(row.id) ?? 0,
      liked: liked.has(row.id),
    };
  });
}
