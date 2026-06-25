import type { Metadata } from "next";
import { UploadForm } from "@/components/studio/upload-form";
import { listGenreNames } from "@/lib/actions/genres";

export const metadata: Metadata = { title: "Upload a book · Bookspace" };

export default async function NewBookPage() {
  const genres = await listGenreNames();
  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Upload a book</h1>
      <p className="mt-1 text-muted-foreground">
        Add a PDF or EPUB to the community library.
      </p>
      <UploadForm genres={genres} />
    </>
  );
}
