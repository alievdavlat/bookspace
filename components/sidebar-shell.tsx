"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookText,
  Users,
  Tags,
  Upload,
  PenLine,
  NotebookPen,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Brand } from "@/components/brand";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const ITEMS: Record<"admin" | "studio", Item[]> = {
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
  topRight,
  children,
}: {
  area: "admin" | "studio";
  label: string;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = ITEMS[area];
  const active = (it: Item) =>
    it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(it.href + "/");

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3 py-3.5">
          <Brand />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <SidebarMenuItem key={it.href}>
                    <SidebarMenuButton isActive={active(it)} tooltip={it.label} render={<Link href={it.href} />}>
                      <Icon />
                      <span>{it.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Back to site" render={<Link href="/" />}>
                <ArrowLeft />
                <span>Back to site</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="font-serif text-sm font-medium text-muted-foreground">{label}</span>
          <div className="ml-auto flex items-center gap-2">{topRight}</div>
        </header>
        <div className="min-w-0 flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
