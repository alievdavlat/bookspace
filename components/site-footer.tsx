import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Brand />
          <p className="text-sm text-muted-foreground">© 2026 Bookspace · Read freely.</p>
        </div>
      </div>
    </footer>
  );
}
