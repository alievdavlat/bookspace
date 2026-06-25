import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { BookReader } from "@/components/reader/book-reader";
import { ReadAloud } from "@/components/read-aloud";

export const metadata: Metadata = { title: "Reader · Bookspace" };

export default async function ReadPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?redirect=/read/${bookId}`);

  const { data: book } = await supabase
    .from("books")
    .select("id, title, slug, file_url, format, type, author_name")
    .eq("id", bookId)
    .single();

  // Written books: render chapters in a prose reading view.
  if (book && book.type === "written") {
    const { data: chapters } = await supabase
      .from("chapters")
      .select("title, content, order")
      .eq("book_id", book.id)
      .order("order", { ascending: true });

    const plainText = (chapters ?? [])
      .map((ch) => (ch.content as { html?: string })?.html ?? "")
      .join(" ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return (
      <div className="flex min-h-screen flex-col bg-[#f7edd8] text-[#3a2c18]">
        <div className="flex items-center justify-between px-5 py-3 text-sm">
          <Link href={`/book/${book.slug}`} className="opacity-80 hover:opacity-100">
            ← Back
          </Link>
          <span className="font-serif">{book.title}</span>
          <ReadAloud text={plainText} />
        </div>
        <article className="prose prose-stone mx-auto w-full max-w-2xl flex-1 px-6 py-10">
          <h1 className="font-serif">{book.title}</h1>
          {(chapters ?? []).map((ch, i) => (
            <section key={i}>
              {ch.title ? <h2 className="font-serif">{ch.title}</h2> : null}
              <div dangerouslySetInnerHTML={{ __html: (ch.content as { html?: string })?.html ?? "" }} />
            </section>
          ))}
        </article>
      </div>
    );
  }

  if (!book || !book.file_url) {
    return (
      <PageShell
        title={book ? book.title : "Reader"}
        subtitle="This book doesn't have a readable file yet."
      >
        {book ? (
          <div className="mt-6">
            <Button render={<Link href={`/book/${book.slug}`} />} nativeButton={false} variant="outline">
              Back to book
            </Button>
          </div>
        ) : null}
      </PageShell>
    );
  }

  // External URL → use directly; otherwise sign the private storage path.
  const isExternal = !!book.file_url && /^https?:\/\//.test(book.file_url);
  const signed = isExternal
    ? { signedUrl: book.file_url as string }
    : (
        await supabase.storage.from("book-files").createSignedUrl(book.file_url, 60 * 60)
      ).data;

  // Resume from saved progress.
  const { data: progress } = await supabase
    .from("reading_progress")
    .select("position")
    .eq("user_id", user.id)
    .eq("book_id", book.id)
    .maybeSingle();

  const startPage = progress?.position ? parseInt(progress.position, 10) || 0 : 0;

  if (!signed?.signedUrl) {
    return (
      <PageShell title={book.title} subtitle="Could not load the book file.">
        <div className="mt-6">
          <Button render={<Link href={`/book/${book.slug}`} />} nativeButton={false} variant="outline">
            Back to book
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <BookReader
      pdfUrl={signed.signedUrl}
      bookId={book.id}
      userId={user.id}
      title={book.title}
      backSlug={book.slug}
      startPage={startPage}
    />
  );
}
