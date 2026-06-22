import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { WriteForm } from "@/components/studio/write-form";

export const metadata: Metadata = { title: "Write a book · Bookspace" };

export default async function WriteBookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/studio/write/new");

  return (
    <PageShell title="Write a book" subtitle="Compose your book online and publish it to the community.">
      <WriteForm />
    </PageShell>
  );
}
