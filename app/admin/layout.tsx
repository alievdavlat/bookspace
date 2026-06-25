import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarShell } from "@/components/sidebar-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu, type MenuProfile } from "@/components/user-menu";

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

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, role")
    .eq("id", user.id)
    .single();
  if (!data || data.role !== "admin") redirect("/dashboard");

  const profile: MenuProfile = data;

  return (
    <SidebarShell
      area="admin"
      label="Admin"
      topRight={
        <>
          <ThemeToggle />
          <UserMenu profile={profile} />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
