"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type WriteFormState = { error?: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createWrittenBook(
  _prev: WriteFormState,
  formData: FormData
): Promise<WriteFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const language = String(formData.get("language") ?? "en");
  const visibility = String(formData.get("visibility") ?? "public");
  const genres = formData.getAll("genres").map(String).filter(Boolean);
  const cover = formData.get("cover") as File | null;

  if (title.length < 2) return { error: "Title is required." };

  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;

  let coverUrl: string | null = null;
  if (cover && cover.size > 0) {
    const cext = (cover.name.split(".").pop() ?? "jpg").toLowerCase();
    const coverPath = `${user.id}/${slug}.${cext}`;
    const { error: coverErr } = await supabase.storage
      .from("covers")
      .upload(coverPath, cover, { upsert: true, contentType: cover.type });
    if (!coverErr) {
      coverUrl = supabase.storage.from("covers").getPublicUrl(coverPath).data.publicUrl;
    }
  }

  const { data: book, error: bookErr } = await supabase
    .from("books")
    .insert({
      author_id: user.id,
      title,
      slug,
      author_name: null,
      description: description || null,
      cover_url: coverUrl,
      language,
      genres,
      type: "written",
      format: "written",
      status: "published",
      visibility,
    })
    .select("id")
    .single();
  if (bookErr || !book) return { error: `Could not create book: ${bookErr?.message}` };

  const { error: chErr } = await supabase.from("chapters").insert({
    book_id: book.id,
    order: 0,
    title: "Chapter 1",
    content: { html: "" },
  });
  if (chErr) return { error: `Could not create first chapter: ${chErr.message}` };

  revalidatePath("/explore");
  revalidatePath("/studio");
  redirect(`/studio/write/${book.id}`);
}

export async function addChapter(bookId: string): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in." };

  const { data: last } = await supabase
    .from("chapters")
    .select("order")
    .eq("book_id", bookId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((last?.order as number | undefined) ?? -1) + 1;

  const { data, error } = await supabase
    .from("chapters")
    .insert({ book_id: bookId, order: nextOrder, title: `Chapter ${nextOrder + 1}`, content: { html: "" } })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Could not add chapter." };
  revalidatePath(`/studio/write/${bookId}`);
  return { id: data.id };
}

export async function updateChapter(chapterId: string, html: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in." };
  const { error } = await supabase.from("chapters").update({ content: { html } }).eq("id", chapterId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function renameChapter(chapterId: string, title: string, bookId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("chapters").update({ title: title.slice(0, 120) }).eq("id", chapterId);
  revalidatePath(`/studio/write/${bookId}`);
}

export async function deleteChapter(chapterId: string, bookId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("chapters").delete().eq("id", chapterId);
  revalidatePath(`/studio/write/${bookId}`);
}

export async function reorderChapters(bookId: string, orderedIds: string[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("chapters").update({ order: i }).eq("id", id))
  );
  revalidatePath(`/studio/write/${bookId}`);
}
