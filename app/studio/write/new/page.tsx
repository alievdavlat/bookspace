import type { Metadata } from "next";
import { WriteForm } from "@/components/studio/write-form";
import { listGenreNames } from "@/lib/actions/genres";

export const metadata: Metadata = { title: "Write a book · Bookspace" };

export default async function WriteBookPage() {
  const genres = await listGenreNames();
  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Write a book</h1>
      <p className="mt-1 text-muted-foreground">
        Compose your book online and publish it to the community.
      </p>
      <WriteForm genres={genres} />
    </>
  );
}
