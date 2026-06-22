import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell, ComingSoon } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

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
    .select("title, slug")
    .eq("id", bookId)
    .single();

  return (
    <PageShell
      title={book ? `Reading: ${book.title}` : "Reader"}
      subtitle="The page-flip reader is coming next."
    >
      <ComingSoon phase="F3 (Reader ⭐)" />
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
