import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-serif text-xl font-semibold tracking-tight text-foreground",
        className
      )}
    >
      Bookspace<span className="text-primary">.</span>
    </Link>
  );
}
