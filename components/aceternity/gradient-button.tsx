import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Animated gradient CTA. Renders a Link when `href` is given, else a button. */
export function GradientButton({
  children,
  href,
  className,
  ...props
}: {
  children: ReactNode;
  href?: string;
  className?: string;
} & ComponentProps<"button">) {
  const inner = (
    <span className="relative inline-flex items-center justify-center gap-2 rounded-full bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors">
      {children}
    </span>
  );
  const wrapper =
    "bs-gradient inline-block rounded-full bg-[linear-gradient(110deg,var(--primary),#6366f1,#22d3ee,var(--primary))] p-[2px] shadow-[0_8px_30px_-12px_var(--primary)] transition-transform hover:scale-[1.02]";

  if (href) {
    return (
      <Link href={href} className={cn(wrapper, className)}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cn(wrapper, className)} {...props}>
      {inner}
    </button>
  );
}
