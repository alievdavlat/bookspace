import type { Metadata } from "next";
import { PageShell, ComingSoon } from "@/components/page-shell";

export const metadata: Metadata = { title: "Settings · Bookspace" };

export default function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="Profile, account and reading preferences.">
      <ComingSoon phase="F6 (Dashboard & Settings)" />
    </PageShell>
  );
}
