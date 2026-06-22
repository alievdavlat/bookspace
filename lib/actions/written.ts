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
  const html = String(formData.get("content") ?? "").trim();
  const cover = formData.get("cover") as File | null;

  if (title.length < 2) return { error: "Title is required." };
  if (!html || html === "<p></p>") return { error: "Write some content first." };

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
    content: { html },
  });
  if (chErr) return { error: `Could not save content: ${chErr.message}` };

  revalidatePath("/explore");
  revalidatePath("/studio");
  redirect(`/book/${slug}`);
}
