import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReadAloud } from "@/components/read-aloud";
import { TracingBeam } from "@/components/aceternity/tracing-beam";
import { LikeButton } from "@/components/social/like-button";
import { Comments, type CommentItem } from "@/components/social/comments";
import { AiTools } from "@/components/ai/ai-tools";
import { cleanHtml } from "@/lib/sanitize";

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
  id: string;
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
      "id, title, content, published_at, status, author:profiles!blog_posts_author_id_fkey(username, display_name)"
    )
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const post = data as unknown as Post;
  const author = post.author?.display_name || post.author?.username || "Unknown";
  const plainText = (post.content?.html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ count: likeCount }, { data: likedRow }, { data: commentRows }] = await Promise.all([
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("target_type", "blog").eq("target_id", post.id),
    user
      ? supabase.from("likes").select("id").eq("user_id", user.id).eq("target_type", "blog").eq("target_id", post.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("comments")
      .select("id, body, created_at, user_id, user:profiles!comments_user_id_fkey(username, display_name, avatar_url)")
      .eq("target_type", "blog")
      .eq("target_id", post.id)
      .order("created_at", { ascending: false }),
  ]);
  const comments = (commentRows ?? []) as unknown as CommentItem[];

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
          <div className="flex items-center gap-2">
            <LikeButton
              targetType="blog"
              targetId={post.id}
              initialLiked={!!likedRow}
              initialCount={likeCount ?? 0}
              canLike={!!user}
            />
            <ReadAloud text={plainText} />
          </div>
        </div>
        {plainText.length > 80 ? (
          <div className="mt-6">
            <AiTools text={plainText} label="AI · summarize or translate this post" />
          </div>
        ) : null}

        <TracingBeam className="mt-8">
          <article
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanHtml(post.content?.html) }}
          />
        </TracingBeam>

        <Comments
          targetType="blog"
          targetId={post.id}
          path={`/blog/${slug}`}
          comments={comments}
          currentUserId={user?.id ?? null}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
