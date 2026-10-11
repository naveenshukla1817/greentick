import { BadgeCheck, Clock3, FileCheck2, FileWarning, CircleDot } from "lucide-react";
import type { TaskStatus } from "@/lib/workspace-shared";
import { statusLabel } from "@/lib/workspace-shared";

const statusIcons = {
  assigned: CircleDot,
  in_progress: Clock3,
  submitted: FileCheck2,
  changes_requested: FileWarning,
  approved: BadgeCheck,
} satisfies Record<TaskStatus, typeof CircleDot>;

export function StatusBadge({ status }: { status: TaskStatus }) {
  const Icon = statusIcons[status];
  return <span className={`status-pill status-${status.replaceAll("_", "-")}`}><Icon size={13} aria-hidden="true"/><span>{statusLabel(status)}</span></span>;
}
