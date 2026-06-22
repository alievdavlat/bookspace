import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Studio · Bookspace" };

export default async function StudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/studio");

  const { data: books } = await supabase
    .from("books")
    .select("id, title, slug, status, visibility, type, views, cover_url")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <PageShell
      title="Studio"
      subtitle="Upload a PDF/EPUB or write a book online, chapter by chapter."
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <Button render={<Link href="/studio/book/new" />} nativeButton={false}>
          Upload a book
        </Button>
        <Button variant="outline" disabled>
          Write online (soon)
        </Button>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-semibold">Your books</h2>
      {!books || books.length === 0 ? (
        <p className="mt-4 text-muted-foreground">
          You haven&apos;t published anything yet. Upload your first book above.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {books.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <Link href={`/book/${b.slug}`} className="font-medium hover:text-primary">
                  {b.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {b.type} · {b.status} · {b.visibility} · {b.views ?? 0} views
                </p>
              </div>
              <Button
                render={<Link href={`/book/${b.slug}`} />}
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                View
              </Button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
