import { WorkspaceLayout } from "@/components/workspace-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout area="dashboard" label="Overview">{children}</WorkspaceLayout>;
}
