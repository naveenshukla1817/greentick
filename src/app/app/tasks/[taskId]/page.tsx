import type { Metadata } from "next";
import { getWorkspaceData } from "@/lib/workspace-data";
import { TaskDetailView } from "@/components/workspace/task-detail-view";

export const metadata: Metadata = { title: "Task details", robots: { index: false, follow: false } };
export default async function TaskDetailsPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const workspace = await getWorkspaceData({ includeProofFiles: true, proofTaskId: taskId });
  return <TaskDetailView taskId={taskId} initialTasks={workspace.tasks} canSubmit={workspace.isDemo || workspace.tasks.find((task) => task.id === taskId)?.assigneeId === workspace.currentUserId} currentRole={workspace.currentRole} isDemo={workspace.isDemo}/>;
}
