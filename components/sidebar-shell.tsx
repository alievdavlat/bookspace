"use client";

import type { ReactNode } from "react";
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
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Brand } from "@/components/brand";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const sub = SUBNAV[area] ?? [];

  // Level-1 app areas (the narrow rail).
  const rail: Item[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/library", label: "My library", icon: Library },
    { href: "/studio", label: "Studio", icon: PenTool },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
    ...(username ? [{ href: `/author/${username}`, label: "Profile", icon: User }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const railActive = (it: Item) =>
    it.href === "/dashboard"
      ? area === "dashboard"
      : it.href === "/studio"
        ? area === "studio"
        : it.href === "/admin"
          ? area === "admin"
          : pathname.startsWith(it.href);

  const subActive = (it: Item) =>
    it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/");

  return (
    <div className="flex min-h-screen">
      {/* Level 1 — narrow icon rail */}
      <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3">
        <Link href="/" className="mb-2 grid size-9 place-items-center rounded-lg bg-primary font-serif text-lg font-bold text-primary-foreground">
          B
        </Link>
        {rail.map((it) => {
          const Icon = it.icon;
          const active = railActive(it);
          return (
            <Tooltip key={it.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={it.href}
                    className={cn(
                      "grid size-10 place-items-center rounded-lg transition-colors [&>svg]:size-5",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon />
                  </Link>
                }
              />
              <TooltipContent side="right">{it.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Level 2 — contextual sub-nav (Strapi-style) when the area has one */}
      <SidebarProvider>
        {sub.length > 0 ? (
          <Sidebar collapsible="icon" className="border-r border-border">
            <SidebarHeader className="px-3 py-3.5">
              <Brand />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>{label}</SidebarGroupLabel>
                <SidebarMenu>
                  {sub.map((it) => {
                    const Icon = it.icon;
                    return (
                      <SidebarMenuItem key={it.href}>
                        <SidebarMenuButton isActive={subActive(it)} tooltip={it.label} render={<Link href={it.href} />}>
                          <Icon />
                          <span>{it.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        ) : null}

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
            {sub.length > 0 ? <SidebarTrigger /> : null}
            <span className="font-serif text-sm font-medium text-muted-foreground">{label}</span>
            <div className="ml-auto flex items-center gap-2">{topRight}</div>
          </header>
          <div className="min-w-0 flex-1 p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
