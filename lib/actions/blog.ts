"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type BlogFormState = { error?: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createBlogPost(
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const title = String(formData.get("title") ?? "").trim();
  const html = String(formData.get("content") ?? "").trim();

  if (title.length < 2) return { error: "Title is required." };
  if (!html || html === "<p></p>") return { error: "Write something first." };

  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;

  const { error } = await supabase.from("blog_posts").insert({
    author_id: user.id,
    title,
    slug,
    content: { html },
    status: "published",
    published_at: new Date().toISOString(),
  });
  if (error) return { error: `Could not publish: ${error.message}` };

  revalidatePath("/blog");
  redirect(`/blog/${slug}`);
}
