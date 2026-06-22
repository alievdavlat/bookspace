import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { BookReader } from "@/components/reader/book-reader";

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
    .select("id, title, slug, file_url, format")
    .eq("id", bookId)
    .single();

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

  // Signed URL for the private book file.
  const { data: signed } = await supabase.storage
    .from("book-files")
    .createSignedUrl(book.file_url, 60 * 60);

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
