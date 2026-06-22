import type { Metadata } from "next";
import { PageShell, ComingSoon } from "@/components/page-shell";

export const metadata: Metadata = { title: "Blog · Bookspace" };

export default function BlogPage() {
  return (
    <PageShell title="Blog" subtitle="Essays and notes from the community.">
      <ComingSoon phase="F4 (Studio & Blog)" />
    </PageShell>
  );
}
