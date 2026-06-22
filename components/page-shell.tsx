import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <h1 className="font-serif text-4xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        ) : null}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function ComingSoon({ phase }: { phase: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center">
      <p className="font-serif text-2xl">Coming soon</p>
      <p className="mt-2 text-sm text-muted-foreground">
        This lands in <span className="font-medium text-primary">{phase}</span> of the roadmap.
      </p>
    </div>
  );
}
