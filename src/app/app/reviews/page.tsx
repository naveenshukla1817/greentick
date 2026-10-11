import type { Metadata } from "next";
import { getReviewTaskDetails, getWorkspaceData } from "@/lib/workspace-data";
import { ReviewQueueView } from "@/components/workspace/review-queue-view";

export const metadata: Metadata = { title: "Review inbox", alternates: { canonical: "/app/reviews" }, robots: { index: false, follow: false } };
export default async function ReviewsPage() {
  const workspace = await getWorkspaceData();
  const submittedTaskIds = workspace.tasks.filter((task) => task.status === "submitted").map((task) => task.id);
  const reviewDetails: Awaited<ReturnType<typeof getReviewTaskDetails>> = workspace.isDemo ? {} : await getReviewTaskDetails(submittedTaskIds);
  const reviewTasks = workspace.tasks.map((task) => reviewDetails[task.id] ? { ...task, ...reviewDetails[task.id] } : task);
  return <ReviewQueueView initialTasks={reviewTasks} isDemo={workspace.isDemo} currentRole={workspace.currentRole}/>;
}
