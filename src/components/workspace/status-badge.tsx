import type { TaskStatus } from "@/lib/workspace-shared";
import { statusLabel } from "@/lib/workspace-shared";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const cls = status === "approved" ? "status-pill status-approved" : status === "changes_requested" ? "status-pill status-changes" : "status-pill";
  return <span className={cls}>{statusLabel(status)}</span>;
}
