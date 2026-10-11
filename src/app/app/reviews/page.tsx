import type { Metadata } from "next";
import { getWorkspaceData } from "@/lib/workspace-data";
import { ReviewQueueView } from "@/components/workspace/review-queue-view";

export const metadata: Metadata = { title: "Review inbox", alternates: { canonical: "/app/reviews" }, robots: { index: false, follow: false } };
export default async function ReviewsPage() {
  const workspace = await getWorkspaceData();
  return <ReviewQueueView initialTasks={workspace.tasks} isDemo={workspace.isDemo} currentRole={workspace.currentRole}/>;
}
