import { WorkspaceLayout } from "@/components/workspace-layout";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout area="studio" label="Studio">{children}</WorkspaceLayout>;
}
