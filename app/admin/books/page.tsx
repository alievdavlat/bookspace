import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminBooks, type AdminBook } from "@/components/admin/admin-books";

export const metadata: Metadata = { title: "Books · Admin" };

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("id, title, slug, author_name, cover_url, type, status, visibility, views, created_at")
    .order("created_at", { ascending: false });

  const books = (data ?? []) as AdminBook[];

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Books</h1>
      <p className="mt-1 text-muted-foreground">Every book in the library — publish, unpublish or delete.</p>
      <div className="mt-8">
        <AdminBooks books={books} />
      </div>
    </div>
  );
}
