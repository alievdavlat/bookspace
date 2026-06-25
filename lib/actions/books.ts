"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type BookFormState = { error?: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createUploadedBook(
  _prev: BookFormState,
  formData: FormData
): Promise<BookFormState> {
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
  const file = formData.get("file") as File | null;
  const cover = formData.get("cover") as File | null;
  const fileUrlInput = String(formData.get("file_url") ?? "").trim();
  const coverUrlInput = String(formData.get("cover_url") ?? "").trim();

  if (title.length < 2) return { error: "Title is required." };
  const hasFile = file && file.size > 0;
  if (!hasFile && !fileUrlInput) {
    return { error: "Choose a PDF/EPUB file or paste a file URL." };
  }

  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;
  let filePath: string;
  let format: "pdf" | "epub";

  if (hasFile) {
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (ext !== "pdf" && ext !== "epub") {
      return { error: "Only PDF or EPUB files are supported." };
    }
    format = ext === "epub" ? "epub" : "pdf";
    filePath = `${user.id}/${slug}.${ext}`;
    const { error: fileErr } = await supabase.storage
      .from("book-files")
      .upload(filePath, file, { upsert: true, contentType: file.type });
    if (fileErr) return { error: `File upload failed: ${fileErr.message}` };
  } else {
    // External URL: store as-is; reader uses it directly.
    const ext = (fileUrlInput.split(".").pop() ?? "").toLowerCase();
    format = ext === "epub" ? "epub" : "pdf";
    filePath = fileUrlInput;
  }

  // Optional cover (uploaded file or URL).
  let coverUrl: string | null = coverUrlInput || null;
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

  const { error: insErr } = await supabase.from("books").insert({
    author_id: user.id,
    title,
    slug,
    description: description || null,
    language,
    genres,
    type: "uploaded",
    format,
    file_url: filePath,
    cover_url: coverUrl,
    status: "published",
    visibility,
  });
  if (insErr) return { error: `Could not create book: ${insErr.message}` };

  revalidatePath("/explore");
  revalidatePath("/studio");
  redirect(`/book/${slug}`);
}
