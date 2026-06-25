import { WorkspaceLayout } from "@/components/workspace-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout area="admin" label="Admin">{children}</WorkspaceLayout>;
}
