"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Notif = {
  id: string;
  type: string;
  body: string | null;
  href: string | null;
  read: boolean;
  created_at: string;
  actor: { username: string | null; display_name: string | null } | null;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const uidRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    uidRef.current = user.id;
    const { data } = await supabase
      .from("notifications")
      .select("id, type, body, href, read, created_at, actor:profiles!notifications_actor_id_fkey(username, display_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const list = (data ?? []) as unknown as Notif[];
    setItems(list);
    setUnread(list.filter((n) => !n.read).length);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0 && uidRef.current) {
      const supabase = createClient();
      await supabase.from("notifications").update({ read: true }).eq("user_id", uidRef.current).eq("read", false);
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const actorName = (n: Notif) => n.actor?.display_name || n.actor?.username || "Someone";

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            <p className="border-b border-border px-4 py-2.5 text-sm font-medium">Notifications</p>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                items.map((n) => {
                  const inner = (
                    <div className="flex flex-col gap-0.5 px-4 py-3 hover:bg-secondary">
                      <p className="text-sm">
                        <span className="font-medium">{actorName(n)}</span>{" "}
                        <span className="text-muted-foreground">{n.body || n.type}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                  return n.href ? (
                    <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="block">
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id}>{inner}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
