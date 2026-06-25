import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard · Admin" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: users },
    { count: books },
    { count: published },
    { count: reviews },
    { count: reads },
    { data: recent },
    { data: top },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("reading_progress").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, username, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("books")
      .select("id, title, slug, views")
      .order("views", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: "Users", value: users ?? 0 },
    { label: "Books", value: books ?? 0 },
    { label: "Published", value: published ?? 0 },
    { label: "Reviews", value: reviews ?? 0 },
    { label: "Reads", value: reads ?? 0 },
  ];

  const topBooks = (top ?? []) as { id: string; title: string; slug: string; views: number | null }[];
  const maxViews = Math.max(1, ...topBooks.map((b) => b.views ?? 0));
  const signups = (recent ?? []) as {
    id: string;
    username: string | null;
    display_name: string | null;
    created_at: string;
  }[];

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">An overview of the whole library.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-serif text-3xl font-semibold text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Most viewed books</h2>
          {topBooks.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No books yet.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {topBooks.map((b) => (
                <li key={b.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Link href={`/book/${b.slug}`} className="truncate hover:text-primary">
                      {b.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{b.views ?? 0}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(((b.views ?? 0) / maxViews) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Recent signups</h2>
          {signups.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {signups.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/author/${u.username}`} className="truncate hover:text-primary">
                    {u.display_name || u.username || "Reader"}
                    <span className="ml-2 text-xs text-muted-foreground">@{u.username}</span>
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
