import type { Metadata } from "next";
import { PageShell, ComingSoon } from "@/components/page-shell";

export const metadata: Metadata = { title: "Community · Bookspace" };

export default function CommunityPage() {
  return (
    <PageShell title="Community" subtitle="Readers and authors you follow.">
      <ComingSoon phase="F5 (Community)" />
    </PageShell>
  );
}
