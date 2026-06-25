import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Infinite horizontal marquee with edge fade. Pauses on hover. */
export function Marquee({
  children,
  className,
  durationSec = 40,
}: {
  children: ReactNode;
  className?: string;
  durationSec?: number;
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className
      )}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className="bs-marquee flex shrink-0 items-center gap-5 pr-5 group-hover:[animation-play-state:paused]"
          style={{ ["--bs-marquee-dur" as string]: `${durationSec}s` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
