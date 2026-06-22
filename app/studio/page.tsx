import type { Metadata } from "next";
import { PageShell, ComingSoon } from "@/components/page-shell";

export const metadata: Metadata = { title: "Studio · Bookspace" };

export default function StudioPage() {
  return (
    <PageShell
      title="Studio"
      subtitle="Upload a PDF/EPUB or write a book online, chapter by chapter."
    >
      <ComingSoon phase="F2 (Upload) & F4 (Write)" />
    </PageShell>
  );
}
