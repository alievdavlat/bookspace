"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  PenTool,
  Settings as SettingsIcon,
  User,
  Shield,
  BookText,
  Users,
  Tags,
  Upload,
  PenLine,
  NotebookPen,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const SUBNAV: Record<string, Item[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/books", label: "Books", icon: BookText },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/genres", label: "Genres", icon: Tags },
    { href: "/admin/studio", label: "Studio", icon: Upload },
  ],
  studio: [
    { href: "/studio", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/studio/book/new", label: "Upload book", icon: Upload },
    { href: "/studio/write/new", label: "Write book", icon: PenLine },
    { href: "/studio/blog/new", label: "Write blog", icon: NotebookPen },
  ],
};

export function SidebarShell({
  area,
  label,
  username,
  isAdmin,
  topRight,
  children,
}: {
  area: "admin" | "studio" | "dashboard";
  label: string;
  username?: string | null;
  isAdmin?: boolean;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sub = SUBNAV[area] ?? [];

  const main: Item[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/library", label: "My library", icon: Library },
    { href: "/studio", label: "Studio", icon: PenTool },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
    ...(username ? [{ href: `/author/${username}`, label: "Profile", icon: User }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const mainActive = (it: Item) =>
    it.href === "/dashboard"
      ? area === "dashboard" && pathname === "/dashboard"
      : it.href === "/studio"
        ? area === "studio"
        : it.href === "/admin"
          ? area === "admin"
          : pathname.startsWith(it.href);

  const subActive = (it: Item) =>
    it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/");

  const itemClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&>svg]:size-4 [&>svg]:shrink-0",
      active
        ? "bg-primary/10 font-medium text-primary"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    );

  const MainNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col gap-0.5">
      {main.map((it) => {
        const Icon = it.icon;
        return (
          <Link key={it.href} href={it.href} onClick={onNavigate} className={itemClass(mainActive(it))}>
            <Icon />
            {it.label}
          </Link>
        );
      })}
    </div>
  );

  const SubNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col gap-0.5">
      {sub.map((it) => {
        const Icon = it.icon;
        return (
          <Link key={it.href} href={it.href} onClick={onNavigate} className={itemClass(subActive(it))}>
            <Icon />
            {it.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Main (dashboard) sidebar — always visible on desktop */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar p-3 md:flex">
        <div className="px-2 py-2">
          <Brand />
        </div>
        <div className="mt-3">
          <MainNav />
        </div>
      </aside>

      {/* Second (contextual) sidebar — beside the main one, Strapi-style */}
      {sub.length > 0 ? (
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-sidebar/40 p-3 md:flex">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <SubNav />
        </aside>
      ) : null}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-serif text-sm font-medium text-muted-foreground">{label}</span>
          <div className="ml-auto flex items-center gap-2">{topRight}</div>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>

      {/* Mobile: both navs in a sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto p-4">
          <SheetTitle className="px-3 font-serif text-lg">Bookspace</SheetTitle>
          <div className="mt-5">
            <MainNav onNavigate={() => setMobileOpen(false)} />
          </div>
          {sub.length > 0 ? (
            <div className="mt-5 border-t border-border pt-4">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <SubNav onNavigate={() => setMobileOpen(false)} />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
