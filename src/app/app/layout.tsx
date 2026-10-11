import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getWorkspaceIdentity } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const workspace = await getWorkspaceIdentity();
  return <WorkspaceShell teamName={workspace.teamName} userName={workspace.currentUserName} isDemo={workspace.isDemo}>{children}</WorkspaceShell>;
}
