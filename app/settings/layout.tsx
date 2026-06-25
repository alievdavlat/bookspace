import { WorkspaceLayout } from "@/components/workspace-layout";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout area="dashboard" label="Settings">{children}</WorkspaceLayout>;
}
