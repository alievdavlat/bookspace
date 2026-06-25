import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/studio/upload-form";
import { BulkUploadForm } from "@/components/admin/bulk-upload-form";
import { Button } from "@/components/ui/button";
import { listGenreNames } from "@/lib/actions/genres";

export const metadata: Metadata = { title: "Studio · Admin" };

export default async function AdminStudioPage() {
  const genres = await listGenreNames();

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-semibold">Studio</h1>
      <p className="mt-1 text-muted-foreground">Add content to the library.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button render={<Link href="/studio/write/new" />} nativeButton={false} variant="outline" size="sm">
          Write a book
        </Button>
        <Button render={<Link href="/studio/blog/new" />} nativeButton={false} variant="outline" size="sm">
          Write a blog post
        </Button>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">Bulk upload</h2>
        <div className="mt-4">
          <BulkUploadForm />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold">Single upload</h2>
        <UploadForm genres={genres} />
      </section>
    </div>
  );
}
