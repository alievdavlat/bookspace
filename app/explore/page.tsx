import type { Metadata } from "next";
import { PageShell, ComingSoon } from "@/components/page-shell";

export const metadata: Metadata = { title: "Explore · Bookspace" };

export default function ExplorePage() {
  return (
    <PageShell
      title="Explore"
      subtitle="Discover your next read across the community library."
    >
      <ComingSoon phase="F2 (Catalog)" />
    </PageShell>
  );
}
