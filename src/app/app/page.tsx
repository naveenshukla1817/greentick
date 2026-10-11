import type { Metadata } from "next";
import { getWorkspaceData } from "@/lib/workspace-data";
import { DashboardView } from "@/components/workspace/dashboard-view";

export const metadata: Metadata = { title: "Overview", alternates: { canonical: "/app" }, robots: { index: false, follow: false } };

export default async function WorkspaceOverviewPage() {
  const workspace = await getWorkspaceData();
  return <DashboardView initialTasks={workspace.tasks} members={workspace.members} teamId={workspace.teamId} teamName={workspace.teamName} memberCount={workspace.memberCount} isDemo={workspace.isDemo} userName={workspace.currentUserName} currentRole={workspace.currentRole} currentUserId={workspace.currentUserId}/>;
}
