"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookText, Users, Tags, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/books", label: "Books", icon: BookText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/genres", label: "Genres", icon: Tags },
  { href: "/admin/studio", label: "Studio", icon: Upload },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {ITEMS.map((it) => {
        const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
