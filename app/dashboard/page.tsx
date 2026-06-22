import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard · Bookspace" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  const name = profile?.display_name || profile?.username || "reader";

  const cards = [
    { title: "Continue reading", body: "Your in-progress books appear here.", href: "/library", cta: "My library" },
    { title: "Discover", body: "Find your next read in the community library.", href: "/explore", cta: "Explore" },
    { title: "Create", body: "Write a new book or upload a PDF/EPUB.", href: "/studio", cta: "Open studio" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <p className="text-sm text-primary">Welcome back</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold">Hello, {name} 👋</h1>
        <p className="mt-2 text-muted-foreground">
          Your reading stats and recommendations will grow as you use Bookspace.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.body}</p>
              <Button
                render={<Link href={c.href} />}
                variant="outline"
                size="sm"
                className="mt-4 self-start"
              >
                {c.cta}
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
