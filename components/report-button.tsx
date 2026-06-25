"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createReport } from "@/lib/actions/moderation";

export function ReportButton({
  targetType,
  targetId,
  canReport,
}: {
  targetType: "book" | "blog" | "comment" | "review" | "profile";
  targetId: string;
  canReport: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!canReport) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Flag className="size-3.5" /> Report
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <form
            action={async (fd) => {
              await createReport(fd);
              setOpen(false);
              toast.success("Reported — thanks. Our team will review it.");
            }}
            className="absolute left-0 z-20 mt-2 w-64 rounded-xl border border-border bg-popover p-3 shadow-xl"
          >
            <input type="hidden" name="target_type" value={targetType} />
            <input type="hidden" name="target_id" value={targetId} />
            <textarea
              name="reason"
              rows={3}
              placeholder="What's wrong with this content?"
              className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-ring"
            />
            <Button type="submit" size="sm" className="mt-2 w-full">
              Submit report
            </Button>
          </form>
        </>
      ) : null}
    </div>
  );
}
