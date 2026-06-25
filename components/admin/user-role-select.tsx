"use client";

import { useRef } from "react";
import { setUserRole } from "@/lib/actions/admin";

const ROLES = ["reader", "author", "admin"];

export function UserRoleSelect({ id, role }: { id: string; role: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form action={setUserRole} ref={formRef}>
      <input type="hidden" name="id" value={id} />
      <select
        name="role"
        defaultValue={role}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </form>
  );
}
