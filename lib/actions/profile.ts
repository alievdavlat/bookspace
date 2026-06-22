"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileState = { error?: string; ok?: boolean };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const language = String(formData.get("language") ?? "uz");
  const avatar = formData.get("avatar") as File | null;

  const update: Record<string, unknown> = {
    display_name: displayName || null,
    bio: bio || null,
    language,
  };

  if (avatar && avatar.size > 0) {
    const ext = (avatar.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, { upsert: true, contentType: avatar.type });
    if (!upErr) {
      const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      update.avatar_url = `${url}?v=${Date.now()}`;
    }
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
