import { WorkspaceLayout } from "@/components/workspace-layout";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout area="dashboard" label="My library">{children}</WorkspaceLayout>;
}
