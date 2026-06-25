"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/actions/auth";

export type MenuProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ profile }: { profile: MenuProfile }) {
  const name = profile.display_name || profile.username || "Reader";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-9 border border-border">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={name} /> : null}
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col px-2 py-1.5">
          <span className="text-sm font-medium">{name}</span>
          {profile.username ? (
            <span className="text-xs text-muted-foreground">@{profile.username}</span>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/library" />}>My library</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/studio" />}>Studio</DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={profile.username ? `/author/${profile.username}` : "/dashboard"} />}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>Settings</DropdownMenuItem>
        {profile.role === "admin" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />}>Admin</DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
