"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserRole } from "@/lib/actions/admin";

const ROLES = ["reader", "author", "admin"];

export function UserRoleSelect({ id, role }: { id: string; role: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={role}
      onValueChange={(v) => {
        if (!v) return;
        startTransition(async () => {
          const fd = new FormData();
          fd.set("id", id);
          fd.set("role", v);
          await setUserRole(fd);
          toast.success(`Role set to ${v}`);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-28" disabled={pending}>
        <SelectValue>{(v: string) => v}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
