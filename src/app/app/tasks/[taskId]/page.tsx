import type { Metadata } from "next";
import { getTaskSubmissionDetails, getWorkspaceData } from "@/lib/workspace-data";
import { TaskDetailView } from "@/components/workspace/task-detail-view";

export const metadata: Metadata = { title: "Task details", robots: { index: false, follow: false } };
export default async function TaskDetailsPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const workspace = await getWorkspaceData();
  const selectedTask = workspace.tasks.find((task) => task.id === taskId);
  const submissionDetails = selectedTask ? await getTaskSubmissionDetails(taskId) : { submissionId: null, note: null, files: [] };
  const taskAwareList = workspace.tasks.map((task) => task.id === taskId ? {
    ...task,
    latestSubmissionId: submissionDetails.submissionId,
    latestSubmissionNote: submissionDetails.note,
    latestSubmissionFiles: submissionDetails.files,
  } : task);
  return <TaskDetailView taskId={taskId} initialTasks={taskAwareList} canSubmit={workspace.isDemo || workspace.tasks.find((task) => task.id === taskId)?.assigneeId === workspace.currentUserId} currentRole={workspace.currentRole} isDemo={workspace.isDemo} currentUserId={workspace.currentUserId}/>;
}
