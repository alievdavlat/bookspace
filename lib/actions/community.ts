"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; ok?: boolean };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function addReview(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sign in to review." };

  const bookId = String(formData.get("book_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = parseInt(String(formData.get("rating") ?? "0"), 10);
  const body = String(formData.get("body") ?? "").trim();
  if (rating < 1 || rating > 5) return { error: "Pick a rating from 1 to 5." };

  const { error } = await supabase
    .from("reviews")
    .upsert({ book_id: bookId, user_id: user.id, rating, body }, { onConflict: "book_id,user_id" });
  if (error) return { error: error.message };

  revalidatePath(`/book/${slug}`);
  return { ok: true };
}

const SHELVES = ["Want to read", "Reading", "Read"];

export async function addToShelf(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sign in to use shelves." };

  const bookId = String(formData.get("book_id") ?? "");
  const shelfName = String(formData.get("shelf") ?? "");
  if (!SHELVES.includes(shelfName)) return { error: "Unknown shelf." };

  // Find or create the user's shelf.
  let shelfId: string | null = null;
  const { data: existing } = await supabase
    .from("shelves")
    .select("id")
    .eq("owner_id", user.id)
    .eq("name", shelfName)
    .maybeSingle();
  if (existing) shelfId = existing.id;
  else {
    const { data: created, error } = await supabase
      .from("shelves")
      .insert({ owner_id: user.id, name: shelfName, is_system: true, visibility: "private" })
      .select("id")
      .single();
    if (error || !created) return { error: error?.message ?? "Could not create shelf." };
    shelfId = created.id;
  }

  const { error: itemErr } = await supabase
    .from("shelf_items")
    .upsert({ shelf_id: shelfId, book_id: bookId }, { onConflict: "shelf_id,book_id" });
  if (itemErr) return { error: itemErr.message };

  revalidatePath("/library");
  return { ok: true };
}

export async function toggleFollow(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;
  const targetId = String(formData.get("target_id") ?? "");
  const username = String(formData.get("username") ?? "");
  if (!targetId || targetId === user.id) return;

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
  }
  revalidatePath(`/author/${username}`);
}
