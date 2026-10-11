export type TaskStatus = "assigned" | "in_progress" | "submitted" | "changes_requested" | "approved";
export type TaskProofFile = { id: string; name: string; url: string; mimeType?: string | null; sizeBytes?: number | null };
export type Task = {
  id: string;
  teamId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assigneeName: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  updatedAt: string;
  latestSubmissionId?: string | null;
  latestSubmissionNote?: string | null;
  latestSubmissionFiles?: TaskProofFile[];
};
export type WorkspaceMember = { id: string; name: string; role: "owner" | "member"; avatarSrc?: string | null };
export type WorkspaceTeam = { id: string; name: string; role: "owner" | "member" };
export type WorkspaceData = {
  tasks: Task[]; teamId: string | null; teamName: string; teams: WorkspaceTeam[]; memberCount: number; members: WorkspaceMember[];
  isDemo: boolean; currentUserName: string; currentUserId: string; currentUserEmail: string;
  currentRole: "owner" | "member";
};

export const DEMO_TASKS: Task[] = [
  { id: "demo-1", teamId: "demo-team", title: "Homepage direction — v2", description: "Apply the feedback from the first review and share the updated desktop design.", status: "submitted", priority: "high", assigneeName: "Priya Shah", assigneeId: "demo-priya", dueAt: "2026-10-09T18:00:00+05:30", updatedAt: "2026-10-09T15:10:00+05:30" },
  { id: "demo-2", teamId: "demo-team", title: "Product demo cut", description: "Final edit with captions and clean audio levels.", status: "in_progress", priority: "high", assigneeName: "Arjun Rao", assigneeId: "demo-arjun", dueAt: "2026-10-10T17:00:00+05:30", updatedAt: "2026-10-09T13:30:00+05:30" },
  { id: "demo-3", teamId: "demo-team", title: "Campaign asset exports", description: "Export the approved crops for web and social.", status: "changes_requested", priority: "medium", assigneeName: "Meera Iyer", assigneeId: "demo-meera", dueAt: "2026-10-11T17:00:00+05:30", updatedAt: "2026-10-08T17:00:00+05:30" },
  { id: "demo-4", teamId: "demo-team", title: "Customer interview notes", description: "Summarize the top patterns from three interviews.", status: "assigned", priority: "low", assigneeName: "Arjun Rao", assigneeId: "demo-arjun", dueAt: "2026-10-12T17:00:00+05:30", updatedAt: "2026-10-08T12:15:00+05:30" },
  { id: "demo-5", teamId: "demo-team", title: "Landing page design", description: "Final responsive layout and component notes.", status: "approved", priority: "medium", assigneeName: "Priya Shah", assigneeId: "demo-priya", dueAt: "2026-10-08T17:00:00+05:30", updatedAt: "2026-10-08T10:24:00+05:30" },
  { id: "demo-6", teamId: "demo-team", title: "Onboarding checklist", description: "The updated checklist with all required steps.", status: "approved", priority: "low", assigneeName: "Meera Iyer", assigneeId: "demo-meera", dueAt: null, updatedAt: "2026-10-07T11:00:00+05:30" },
];

export function statusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = { assigned: "Assigned", in_progress: "In progress", submitted: "Awaiting review", changes_requested: "Changes requested", approved: "Approved" };
  return labels[status];
}

export function shortDate(value?: string | null) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(date);
}
