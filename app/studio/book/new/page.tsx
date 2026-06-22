import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { UploadForm } from "@/components/studio/upload-form";

export const metadata: Metadata = { title: "Upload a book · Bookspace" };

export default async function NewBookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/studio/book/new");

  return (
    <PageShell
      title="Upload a book"
      subtitle="Add a PDF or EPUB to the community library. Writing online comes next."
    >
      <UploadForm />
    </PageShell>
  );
}
