"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Aceternity-style tracing beam: a gradient line on the left that fills as you scroll the content. */
export function TracingBeam({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 15%", "end 85%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const dotTop = useTransform(fill, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Beam rail (desktop only) */}
      <div className="pointer-events-none absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-border md:block">
        <motion.div
          style={{ scaleY: fill }}
          className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-primary via-primary to-primary/0"
        />
        <motion.span
          style={{ top: dotTop }}
          className="absolute -left-[3px] size-2 rounded-full bg-primary shadow-[0_0_10px_2px_var(--primary)]"
        />
      </div>
      <div className="md:pl-8">{children}</div>
    </div>
  );
}
