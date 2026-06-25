import type { Metadata } from "next";
import { WriteForm } from "@/components/studio/write-form";

export const metadata: Metadata = { title: "Write a book · Bookspace" };

export default function WriteBookPage() {
  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Write a book</h1>
      <p className="mt-1 text-muted-foreground">
        Compose your book online and publish it to the community.
      </p>
      <WriteForm />
    </>
  );
}
