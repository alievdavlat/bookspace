import { WorkspaceLayout } from "@/components/workspace-layout";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout area="dashboard" label="Feed">{children}</WorkspaceLayout>;
}
