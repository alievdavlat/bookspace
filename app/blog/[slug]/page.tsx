import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReadAloud } from "@/components/read-aloud";
import { TracingBeam } from "@/components/aceternity/tracing-beam";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("title").eq("slug", slug).single();
  return { title: data ? `${data.title} · Bookspace` : "Post · Bookspace" };
}

type Post = {
  title: string;
  content: { html?: string } | null;
  published_at: string | null;
  author: { username: string | null; display_name: string | null } | null;
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "title, content, published_at, status, author:profiles!blog_posts_author_id_fkey(username, display_name)"
    )
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const post = data as unknown as Post;
  const author = post.author?.display_name || post.author?.username || "Unknown";
  const plainText = (post.content?.html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← All posts
        </Link>
        <h1 className="mt-4 font-serif text-4xl font-semibold">{post.title}</h1>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {author}
            {post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ""}
          </p>
          <ReadAloud text={plainText} />
        </div>
        <TracingBeam className="mt-8">
          <article
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content?.html ?? "" }}
          />
        </TracingBeam>
      </main>
      <SiteFooter />
    </div>
  );
}
