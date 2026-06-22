import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/brand";
import { UserMenu, type MenuProfile } from "@/components/user-menu";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: MenuProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data ?? { username: null, display_name: null, avatar_url: null };
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <>
              <Button render={<Link href="/sign-in" />} variant="ghost" size="sm">
                Log in
              </Button>
              <Button render={<Link href="/sign-up" />} size="sm">
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
