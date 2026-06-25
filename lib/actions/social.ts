"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function addComment(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const target_type = String(formData.get("target_type") ?? "");
  const target_id = String(formData.get("target_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const path = String(formData.get("path") ?? "");
  if (!body || !["book", "blog", "review"].includes(target_type)) return;
  await supabase.from("comments").insert({ target_type, target_id, user_id: user.id, body: body.slice(0, 2000) });
  if (path) revalidatePath(path);
}

export async function deleteComment(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "");
  if (!id) return;
  await supabase.from("comments").delete().eq("id", id).eq("user_id", user.id);
  if (path) revalidatePath(path);
}

export async function toggleLike(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const target_type = String(formData.get("target_type") ?? "");
  const target_id = String(formData.get("target_id") ?? "");
  if (!["book", "blog", "comment", "review"].includes(target_type)) return;

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", target_type)
    .eq("target_id", target_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ user_id: user.id, target_type, target_id });
  }
}
