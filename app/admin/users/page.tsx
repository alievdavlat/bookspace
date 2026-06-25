import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export const metadata: Metadata = { title: "Users · Admin" };

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: bookRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("books").select("author_id"),
  ]);

  const bookCount = new Map<string, number>();
  for (const b of (bookRows ?? []) as { author_id: string }[])
    bookCount.set(b.author_id, (bookCount.get(b.author_id) ?? 0) + 1);

  const users = (profiles ?? []) as {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
  }[];

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Users</h1>
      <p className="mt-1 text-muted-foreground">{users.length} members. Change a role inline.</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Books</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const name = u.display_name || u.username || "Reader";
              return (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link href={`/author/${u.username}`} className="flex items-center gap-3 hover:text-primary">
                      <Avatar className="size-8">
                        {u.avatar_url ? <AvatarImage src={u.avatar_url} alt={name} /> : null}
                        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{name}</span>
                        <span className="block truncate text-xs text-muted-foreground">@{u.username}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{bookCount.get(u.id) ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleSelect id={u.id} role={u.role} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
