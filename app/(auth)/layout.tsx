import { Brand } from "@/components/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial side panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-secondary/40 p-10 lg:flex">
        <div
          aria-hidden
          className="bs-aurora pointer-events-none absolute -top-32 -left-20 h-[460px] w-[460px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--primary), transparent 70%)" }}
        />
        <Brand />
        <blockquote className="relative max-w-md">
          <p className="font-serif text-3xl leading-snug">
            “A room without books is like a body without a soul.”
          </p>
          <footer className="mt-4 text-sm text-muted-foreground">— Cicero</footer>
        </blockquote>
        <p className="text-sm text-muted-foreground">Read freely. Write boldly. Share widely.</p>
      </div>

      {/* Form side */}
      <div className="flex flex-col">
        <div className="p-6 lg:hidden">
          <Brand />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}
