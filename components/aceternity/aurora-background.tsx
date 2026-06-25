import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Animated aurora gradient backdrop (blue family). Pure CSS, reduced-motion aware. */
export function AuroraBackground({
  className,
  children,
  subtle = false,
}: {
  className?: string;
  children?: ReactNode;
  subtle?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className={cn(
            "bs-blob-1 absolute -top-1/4 left-1/5 size-[55vh] rounded-full blur-3xl",
            subtle ? "opacity-40" : "opacity-60"
          )}
          style={{ background: "radial-gradient(closest-side, var(--primary), transparent)" }}
        />
        <div
          className={cn(
            "bs-blob-2 absolute -top-10 right-1/5 size-[48vh] rounded-full blur-3xl",
            subtle ? "opacity-30" : "opacity-45"
          )}
          style={{ background: "radial-gradient(closest-side, #6366f1, transparent)" }}
        />
        <div
          className={cn(
            "bs-blob-3 absolute -bottom-1/4 left-1/2 size-[52vh] -translate-x-1/2 rounded-full blur-3xl",
            subtle ? "opacity-25" : "opacity-40"
          )}
          style={{ background: "radial-gradient(closest-side, #22d3ee, transparent)" }}
        />
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>
      {children}
    </div>
  );
}
