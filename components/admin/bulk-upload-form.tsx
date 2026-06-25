"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { bulkUploadBooks, type BulkState } from "@/lib/actions/admin";

const initial: BulkState = {};

export function BulkUploadForm() {
  const [state, formAction, pending] = useActionState(bulkUploadBooks, initial);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Select multiple PDF/EPUB files. Each becomes a published book; the title is taken from the
        file name (edit later in Books).
      </p>
      <input
        name="files"
        type="file"
        accept=".pdf,.epub"
        multiple
        required
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-primary">{state.ok}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Uploading…" : "Bulk upload"}
      </Button>
    </form>
  );
}
