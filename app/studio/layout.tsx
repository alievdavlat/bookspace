import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StudioSidebar } from "@/components/studio/studio-sidebar";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/studio");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 md:flex-row">
        <aside className="md:w-52 md:shrink-0">
          <p className="mb-3 font-serif text-lg font-semibold">Studio</p>
          <StudioSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
