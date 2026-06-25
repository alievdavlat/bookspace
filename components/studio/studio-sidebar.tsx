"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/studio", label: "Overview" },
  { href: "/studio/book/new", label: "Upload book" },
  { href: "/studio/write/new", label: "Write book" },
  { href: "/studio/blog/new", label: "Write blog" },
];

export function StudioSidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {ITEMS.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
