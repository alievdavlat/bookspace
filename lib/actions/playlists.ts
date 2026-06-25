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

export async function createPlaylist(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "public") === "private" ? "private" : "public";
  if (!title) return;
  await supabase.from("playlists").insert({
    owner_id: user.id,
    title,
    description: description || null,
    visibility,
  });
  const { data: prof } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  if (prof?.username) revalidatePath(`/author/${prof.username}`);
  revalidatePath("/library");
}

export async function deletePlaylist(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("playlists").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/library");
}

/** Add or remove a book from a playlist (toggle). */
export async function addToPlaylist(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const playlistId = String(formData.get("playlist_id") ?? "");
  const bookId = String(formData.get("book_id") ?? "");
  if (!playlistId || !bookId) return;

  const { data: existing } = await supabase
    .from("playlist_items")
    .select("book_id")
    .eq("playlist_id", playlistId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existing) {
    await supabase.from("playlist_items").delete().eq("playlist_id", playlistId).eq("book_id", bookId);
  } else {
    await supabase.from("playlist_items").insert({ playlist_id: playlistId, book_id: bookId });
  }
  revalidatePath(`/playlist/${playlistId}`);
}

/** Create a playlist and immediately add a book to it. */
export async function createPlaylistWithBook(formData: FormData): Promise<void> {
  const { supabase, user } = await authed();
  if (!user) return;
  const title = String(formData.get("title") ?? "").trim();
  const bookId = String(formData.get("book_id") ?? "");
  if (!title || !bookId) return;
  const { data: pl } = await supabase
    .from("playlists")
    .insert({ owner_id: user.id, title, visibility: "public" })
    .select("id")
    .single();
  if (pl) await supabase.from("playlist_items").insert({ playlist_id: pl.id, book_id: bookId });
}
