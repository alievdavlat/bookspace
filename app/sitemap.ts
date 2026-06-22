import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://bookspace.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [{ data: books }, { data: posts }] = await Promise.all([
    supabase.from("books").select("slug, updated_at").eq("status", "published").eq("visibility", "public"),
    supabase.from("blog_posts").select("slug, published_at").eq("status", "published"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/explore", "/blog", "/about"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const bookRoutes: MetadataRoute.Sitemap = (books ?? []).map((b) => ({
    url: `${BASE}/book/${b.slug}`,
    lastModified: b.updated_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.published_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...bookRoutes, ...postRoutes];
}
