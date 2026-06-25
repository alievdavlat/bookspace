import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/brand";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-border bg-card/40 p-4 md:w-60 md:border-b-0 md:border-r md:p-5">
        <Brand />
        <p className="mb-5 mt-1 text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <p className="text-sm text-muted-foreground">Bookspace Admin</p>
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to site
          </Link>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
