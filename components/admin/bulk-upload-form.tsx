"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bulkUploadBooks, type BulkState } from "@/lib/actions/admin";

const initial: BulkState = {};

function titleFromName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function BulkUploadForm() {
  const [state, formAction, pending] = useActionState(bulkUploadBooks, initial);
  const [names, setNames] = useState<string[]>([]);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Select multiple PDF/EPUB files. Each becomes a published book — edit the auto-filled titles below before uploading.
      </p>
      <input
        name="files"
        type="file"
        accept=".pdf,.epub"
        multiple
        required
        onChange={(e) => setNames(Array.from(e.target.files ?? []).map((f) => f.name))}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />

      {names.length > 0 ? (
        <ul className="space-y-2">
          {names.map((n, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
              <Input name={`title_${i}`} defaultValue={titleFromName(n)} aria-label={`Title for ${n}`} />
            </li>
          ))}
        </ul>
      ) : null}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-primary">{state.ok}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Uploading…" : `Bulk upload${names.length ? ` (${names.length})` : ""}`}
      </Button>
    </form>
  );
}
