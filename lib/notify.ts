import type { createClient } from "@/lib/supabase/server";

type DB = Awaited<ReturnType<typeof createClient>>;

export async function notify(
  supabase: DB,
  params: {
    userId: string; // recipient
    actorId: string;
    type: string;
    href?: string | null;
    body?: string | null;
    targetType?: string | null;
    targetId?: string | null;
  }
): Promise<void> {
  if (!params.userId || params.userId === params.actorId) return; // never notify yourself
  await supabase.from("notifications").insert({
    user_id: params.userId,
    actor_id: params.actorId,
    type: params.type,
    href: params.href ?? null,
    body: params.body ?? null,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
  });
}
