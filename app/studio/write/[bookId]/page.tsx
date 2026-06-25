import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChapterEditor, type ChapterData } from "@/components/studio/chapter-editor";

export const metadata: Metadata = { title: "Write · Bookspace" };

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?redirect=/studio/write/${bookId}`);

  const { data: book } = await supabase
    .from("books")
    .select("id, title, slug, author_id, type")
    .eq("id", bookId)
    .single();

  if (!book) notFound();
  if (book.author_id !== user.id) redirect("/studio");

  const { data: chapterRows } = await supabase
    .from("chapters")
    .select("id, title, order, content")
    .eq("book_id", bookId)
    .order("order", { ascending: true });

  const chapters: ChapterData[] = (chapterRows ?? []).map((c) => ({
    id: c.id as string,
    title: (c.title as string) || "Untitled",
    order: (c.order as number) ?? 0,
    html: ((c.content as { html?: string } | null)?.html as string) ?? "",
  }));

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">{book.title}</h1>
        <p className="mt-1 text-muted-foreground">Write and organise your chapters. Changes save automatically.</p>
      </div>
      <ChapterEditor
        bookId={book.id}
        bookTitle={book.title}
        bookSlug={book.slug}
        initialChapters={chapters}
      />
    </>
  );
}
