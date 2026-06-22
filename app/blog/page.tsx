import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Blog · Bookspace" };

type Post = {
  id: string;
  title: string;
  slug: string;
  content: { html?: string } | null;
  published_at: string | null;
  author: { username: string | null; display_name: string | null } | null;
};

function excerpt(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

export default async function BlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, content, published_at, author:profiles!blog_posts_author_id_fkey(username, display_name)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const posts = (data ?? []) as unknown as Post[];

  return (
    <PageShell title="Blog" subtitle="Essays, reviews and notes from the community.">
      {posts.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No posts yet. Be the first to write one.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {posts.map((p) => (
            <li key={p.id} className="py-6">
              <Link href={`/blog/${p.slug}`} className="group">
                <h2 className="font-serif text-2xl font-semibold group-hover:text-primary">{p.title}</h2>
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.author?.display_name || p.author?.username || "Unknown"}
                {p.published_at ? ` · ${new Date(p.published_at).toLocaleDateString()}` : ""}
              </p>
              <p className="mt-2 text-muted-foreground">{excerpt(p.content?.html)}…</p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
