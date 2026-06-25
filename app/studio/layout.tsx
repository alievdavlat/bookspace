import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarShell } from "@/components/sidebar-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import { UserMenu, type MenuProfile } from "@/components/user-menu";

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

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, role")
    .eq("id", user.id)
    .single();
  const profile: MenuProfile = data ?? {
    username: null,
    display_name: null,
    avatar_url: null,
    role: null,
  };

  return (
    <SidebarShell
      area="studio"
      label="Studio"
      topRight={
        <>
          <SearchCommand />
          <ThemeToggle />
          <UserMenu profile={profile} />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
