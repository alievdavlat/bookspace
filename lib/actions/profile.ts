"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileState = { error?: string; ok?: boolean };

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  kind: "avatar" | "banner"
): Promise<string | null> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${userId}/${kind}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return null;
  const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  return `${url}?v=${Date.now()}`;
}

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase, user } = await authed();
  if (!user) return { error: "Not signed in." };

  const update: Record<string, unknown> = {
    display_name: String(formData.get("display_name") ?? "").trim() || null,
    status: String(formData.get("status") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    language: String(formData.get("language") ?? "en"),
  };

  const avatar = formData.get("avatar") as File | null;
  if (avatar && avatar.size > 0) {
    const url = await uploadImage(supabase, user.id, avatar, "avatar");
    if (url) update.avatar_url = url;
  }
  const banner = formData.get("banner") as File | null;
  if (banner && banner.size > 0) {
    const url = await uploadImage(supabase, user.id, banner, "banner");
    if (url) update.banner_url = url;
  }

  const { data: prof } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  if (prof?.username) revalidatePath(`/author/${prof.username}`);
  return { ok: true };
}

// ── Profile sections (About blocks + custom tabs) ──────────────────────────
export async function addSection(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const kind = String(formData.get("kind") ?? "about");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return;
  const { data: last } = await supabase
    .from("profile_sections")
    .select("order")
    .eq("profile_id", user.id)
    .eq("kind", kind)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const order = ((last?.order as number | undefined) ?? -1) + 1;
  await supabase
    .from("profile_sections")
    .insert({ profile_id: user.id, kind: kind === "tab" ? "tab" : "about", title, body: body || null, order });
  revalidatePath("/settings");
}

export async function updateSection(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id || !title) return;
  await supabase.from("profile_sections").update({ title, body: body || null }).eq("id", id).eq("profile_id", user.id);
  revalidatePath("/settings");
}

export async function deleteSection(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("profile_sections").delete().eq("id", id).eq("profile_id", user.id);
  revalidatePath("/settings");
}
