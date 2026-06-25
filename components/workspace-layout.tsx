import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarShell } from "@/components/sidebar-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search/search-command";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu, type MenuProfile } from "@/components/user-menu";

export async function WorkspaceLayout({
  area,
  label,
  children,
}: {
  area: "dashboard" | "studio" | "admin";
  label: string;
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?redirect=/${area === "dashboard" ? "dashboard" : area}`);

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (area === "admin" && data?.role !== "admin") redirect("/dashboard");

  const profile: MenuProfile = data ?? {
    username: null,
    display_name: null,
    avatar_url: null,
    role: null,
  };

  return (
    <SidebarShell
      area={area}
      label={label}
      username={profile.username}
      isAdmin={profile.role === "admin"}
      topRight={
        <>
          <SearchCommand />
          <NotificationBell />
          <ThemeToggle />
          <UserMenu profile={profile} />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
