import type { Metadata } from "next";
import { getWorkspaceData } from "@/lib/workspace-data";
import { TaskListView } from "@/components/workspace/task-list-view";

export const metadata: Metadata = { title: "Tasks", alternates: { canonical: "/app/tasks" }, robots: { index: false, follow: false } };
export default async function TasksPage() {
  const workspace = await getWorkspaceData();
  return <TaskListView initialTasks={workspace.tasks} members={workspace.members} teamId={workspace.teamId} isDemo={workspace.isDemo} canCreate={workspace.currentRole === "owner"}/>;
}
