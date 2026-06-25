"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, isAdmin: p?.role === "admin" };
}

export async function setBookStatus(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["draft", "published", "archived"].includes(status)) return;
  await supabase.from("books").update({ status }).eq("id", id);
  revalidatePath("/admin/books");
  revalidatePath("/explore");
}

export async function deleteBook(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "");
  await supabase.from("books").delete().eq("id", id);
  revalidatePath("/admin/books");
  revalidatePath("/explore");
}

export async function addGenre(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(name);
  if (!slug) return;
  await supabase.from("genres").insert({ name, slug });
  revalidatePath("/admin/genres");
  revalidatePath("/explore");
  revalidatePath("/studio/book/new");
  revalidatePath("/studio/write/new");
}

export async function deleteGenre(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = Number(formData.get("id") ?? 0);
  if (!id) return;
  await supabase.from("genres").delete().eq("id", id);
  revalidatePath("/admin/genres");
  revalidatePath("/explore");
}

export async function setUserRole(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!["reader", "author", "admin"].includes(role)) return;
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/users");
}

export type BulkState = { error?: string; ok?: string };

export async function bulkUploadBooks(_prev: BulkState, formData: FormData): Promise<BulkState> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admins only." };

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose one or more PDF/EPUB files." };

  let ok = 0;
  let skipped = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (ext !== "pdf" && ext !== "epub") {
      skipped++;
      continue;
    }
    const provided = String(formData.get(`title_${i}`) ?? "").trim();
    const title = provided || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled";
    const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;
    const filePath = `${user.id}/${slug}.${ext}`;

    const { error: fe } = await supabase.storage
      .from("book-files")
      .upload(filePath, file, { upsert: true, contentType: file.type });
    if (fe) {
      skipped++;
      continue;
    }
    const { error: ie } = await supabase.from("books").insert({
      author_id: user.id,
      title,
      slug,
      type: "uploaded",
      format: ext === "epub" ? "epub" : "pdf",
      file_url: filePath,
      status: "published",
      visibility: "public",
    });
    if (ie) skipped++;
    else ok++;
  }

  revalidatePath("/admin/books");
  revalidatePath("/explore");
  if (!ok) return { error: "No books uploaded (check the file types)." };
  return { ok: `Uploaded ${ok} book(s)${skipped ? `, skipped ${skipped}` : ""}.` };
}
