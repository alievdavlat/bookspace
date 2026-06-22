import type { Metadata } from "next";
import { PageShell, ComingSoon } from "@/components/page-shell";

export const metadata: Metadata = { title: "My library · Bookspace" };

export default function LibraryPage() {
  return (
    <PageShell
      title="My library"
      subtitle="Your shelves and books in progress."
    >
      <ComingSoon phase="F3 (Reader) & F5 (Shelves)" />
    </PageShell>
  );
}
