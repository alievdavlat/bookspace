import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { BlogForm } from "@/components/blog/blog-form";

export const metadata: Metadata = { title: "Write a post · Bookspace" };

export default async function NewBlogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/studio/blog/new");

  return (
    <PageShell title="Write a post" subtitle="Share an essay, review or note with the community.">
      <BlogForm />
    </PageShell>
  );
}
