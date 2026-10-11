import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getWorkspaceShellData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const workspace = await getWorkspaceShellData();
  return (
    <WorkspaceShell
      teamName={workspace.teamName}
      teamId={workspace.teamId}
      teams={workspace.teams}
      userName={workspace.currentUserName}
      userEmail={workspace.currentUserEmail}
      currentRole={workspace.currentRole}
      isDemo={workspace.isDemo}
      openTasksCount={workspace.openTasksCount}
      reviewCount={workspace.reviewCount}
      submitCount={workspace.submitCount}
      attentionCount={workspace.attentionCount}
    >{children}</WorkspaceShell>
  );
}
