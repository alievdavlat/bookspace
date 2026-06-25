"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function MobileNav({
  items,
  loggedIn,
}: {
  items: { href: string; label: string }[];
  loggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const link = "rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
      >
        <Menu className="size-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetTitle className="px-3 font-serif text-lg">Bookspace</SheetTitle>
          <nav className="mt-6 flex flex-col gap-1">
            {items.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={link}>
                {n.label}
              </Link>
            ))}
            {!loggedIn ? (
              <>
                <div className="my-2 border-t border-border" />
                <Link href="/sign-in" onClick={() => setOpen(false)} className={link}>
                  Log in
                </Link>
                <Link href="/sign-up" onClick={() => setOpen(false)} className={link}>
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-border" />
                <Link href="/dashboard" onClick={() => setOpen(false)} className={link}>
                  Dashboard
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)} className={link}>
                  Settings
                </Link>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
