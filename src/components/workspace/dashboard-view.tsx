"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, CheckCheck, CheckCircle2, ClipboardCheck,
  FileText, ListTodo, Plus, UsersRound, FileUp,
} from "lucide-react";
import type { Task, TaskStatus, WorkspaceMember } from "@/lib/workspace-shared";
import { shortDate } from "@/lib/workspace-shared";
import { useDemoTasks } from "@/lib/use-demo-tasks";
import { StatusBadge } from "@/components/workspace/status-badge";
import { TaskCreateModal } from "@/components/workspace/task-create-modal";
import { Avatar } from "@/components/ui/avatar";

const statusOrder: Array<{ status: TaskStatus; label: string; className: string; color: string }> = [
  { status: "assigned", label: "Assigned", className: "workflow-bar-assigned", color: "var(--status-assigned)" },
  { status: "in_progress", label: "In progress", className: "workflow-bar-progress", color: "var(--status-progress)" },
  { status: "submitted", label: "Awaiting review", className: "workflow-bar-review", color: "var(--status-review)" },
  { status: "changes_requested", label: "Changes requested", className: "workflow-bar-changes", color: "var(--status-changes)" },
  { status: "approved", label: "Approved", className: "workflow-bar-approved", color: "var(--status-approved)" },
];

type DashboardViewProps = {
  initialTasks: Task[];
  members: WorkspaceMember[];
  teamId?: string | null;
  teamName: string;
  memberCount: number;
  isDemo: boolean;
  userName: string;
  currentRole: "owner" | "member";
  currentUserId?: string;
};

export function DashboardView({
  initialTasks, members, teamId, teamName, memberCount, isDemo, currentRole, currentUserId,
}: DashboardViewProps) {
  const { tasks, updateTasks } = useDemoTasks(initialTasks, isDemo);
  const [modalOpen, setModalOpen] = useState(false);
  const counts = useMemo(() => {
    const countFor = (status: TaskStatus) => tasks.filter((task) => task.status === status).length;
    return {
      assigned: countFor("assigned"),
      inProgress: countFor("in_progress"),
      submitted: countFor("submitted"),
      changesRequested: countFor("changes_requested"),
      approved: countFor("approved"),
    };
  }, [tasks]);
  const openCount = counts.assigned + counts.inProgress + counts.changesRequested;
  const myTasks = useMemo(() => tasks.filter((task) => task.assigneeId === currentUserId), [tasks, currentUserId]);
  const primaryActionCount = currentRole === "owner"
    ? counts.submitted
    : myTasks.filter((task) => ["assigned", "in_progress", "changes_requested"].includes(task.status)).length;
  const attention = (currentRole === "owner"
    ? tasks.filter((task) => task.status === "submitted" || task.status === "changes_requested")
    : myTasks.filter((task) => task.status === "changes_requested"))
    .sort((a, b) => {
      const rank = (task: Task) => task.status === "submitted" ? 0 : 1;
      return rank(a) - rank(b);
    }).slice(0, 4);
  const recent = (currentRole === "member" ? myTasks : tasks)
    .slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const nonZeroStatuses = statusOrder.map((item) => ({ ...item, count: tasks.filter((task) => task.status === item.status).length })).filter((item) => item.count > 0);
  const statusTotal = nonZeroStatuses.reduce((sum, item) => sum + item.count, 0);
  const maxStatusCount = Math.max(1, ...nonZeroStatuses.map((item) => item.count));
  const taskLabel = (tasks.length === 1 ? "1 task total" : `${tasks.length} tasks total`);
  const displayTeamName = teamName.trim().split(/\s+/).map((word) => word === word.toUpperCase() && word.length <= 4 ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");

  const metrics = currentRole === "owner" ? [
    { label: "Awaiting review", value: counts.submitted, note: counts.submitted === 1 ? "proof to review" : "proofs to review", icon: ClipboardCheck, tone: counts.submitted > 0 ? "metric-review metric-priority" : "metric-review" },
    { label: "Open tasks", value: openCount, note: openCount === 1 ? "task in progress" : "tasks in progress", icon: ListTodo, tone: "metric-open" },
    { label: "Changes requested", value: counts.changesRequested, note: counts.changesRequested === 1 ? "task needs an update" : "tasks needing an update", icon: FileText, tone: counts.submitted === 0 && counts.changesRequested > 0 ? "metric-changes metric-priority" : "metric-changes" },
    { label: "Team members", value: memberCount, note: memberCount === 1 ? "member in workspace" : "members in workspace", icon: UsersRound, tone: "metric-members" },
  ] : [
    { label: "My tasks", value: myTasks.length, note: "assigned to you", icon: ListTodo, tone: "metric-open" },
    { label: "Submit proof", value: myTasks.filter((task) => ["assigned", "in_progress", "changes_requested"].includes(task.status)).length, note: "ready for your update", icon: FileUp, tone: myTasks.some((task) => ["assigned", "in_progress", "changes_requested"].includes(task.status)) ? "metric-review metric-priority" : "metric-review" },
    { label: "Awaiting review", value: myTasks.filter((task) => task.status === "submitted").length, note: "submitted by you", icon: ClipboardCheck, tone: "metric-members" },
    { label: "Changes requested", value: myTasks.filter((task) => task.status === "changes_requested").length, note: "updates requested", icon: FileText, tone: "metric-changes" },
  ];

  return (
    <>
      <div className="dashboard-welcome-row">
        <div>
          <div className="dashboard-team-context">{displayTeamName}</div>
          <h1>Dashboard</h1>
          <p>{currentRole === "owner" ? "Your team’s tasks, proof submissions, and next actions." : "Your assignments, proof submissions, and updates."}</p>
        </div>
        <div className="dashboard-title-actions">
          <Link href={currentRole === "owner" ? "/app/reviews" : "/app/tasks?view=submit"} className="button button-secondary dashboard-secondary-action">
            <ClipboardCheck size={17} />
            <span>{currentRole === "owner" ? "Review inbox" : "Submit proof"}</span>
            {primaryActionCount > 0 ? <span className="button-count">{primaryActionCount}</span> : null}
          </Link>
          {currentRole === "owner" || isDemo ? (
            !teamId && !isDemo ? <Link href="/app/team" className="button button-primary"><Plus size={17} /> Create team</Link> : <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Assign task</button>
          ) : <Link href="/app/tasks?view=submit" className="button button-primary"><FileUp size={17} /> Submit proof</Link>}
        </div>
      </div>

      {!teamId && !isDemo ? (
        <div className="cookie-inline dashboard-setup-notice">
          <strong>Set up your workspace.</strong> Create a team or join one with an invitation link.
          <Link href="/app/team" className="text-link">Open team setup <ArrowRight size={14} /></Link>
        </div>
      ) : null}

      <div className="dashboard-metrics" aria-label="Workspace summary">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className={`metric dashboard-metric-card ${metric.tone}`} key={metric.label}>
              <div className="dashboard-metric-top">
                <span className="dashboard-metric-icon"><Icon size={19} strokeWidth={1.9} /></span>
                <span className="metric-label">{metric.label}</span>
              </div>
              <div className="metric-value" aria-label={`${metric.value} ${metric.label.toLowerCase()}`}>{metric.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
              <div className="dashboard-metric-foot"><span className="dashboard-metric-indicator">{metric.note}</span></div>
            </article>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <section className="panel dashboard-card dashboard-recent-card">
            <div className="panel-heading dashboard-card-heading">
              <h2>Recent activity</h2>
              <Link href={currentRole === "owner" ? "/app/tasks" : "/app/tasks?view=mine"} className="panel-link">View all <ArrowRight size={15} /></Link>
            </div>
            {recent.length ? (
              <div className="task-table dashboard-task-table">
                {recent.map((task) => (
                  <article key={task.id} className="task-row dashboard-task-row">
                    <span className={`dashboard-task-symbol ${task.status === "approved" ? "is-approved" : task.status === "submitted" ? "is-review" : task.status === "changes_requested" ? "is-changes" : task.status === "assigned" ? "is-assigned" : "is-open"}`}>
                      {task.status === "approved" ? <CheckCheck size={17} /> : task.status === "submitted" ? <ClipboardCheck size={17} /> : task.status === "changes_requested" ? <FileText size={17} /> : <ListTodo size={17} />}
                    </span>
                    <Avatar name={task.assigneeName} src={task.assigneeId === currentUserId ? "/avatars/default.png" : undefined} size={32} className="dashboard-row-avatar" />
                    <div className="dashboard-task-copy">
                      <Link href={`/app/tasks/${task.id}`} className="task-name">{task.title}</Link>
                      <div className="task-meta"><span>{task.assigneeName}</span><span className="separator" /><span>{task.dueAt ? `Due ${shortDate(task.dueAt)}` : "No deadline"}</span></div>
                    </div>
                    <div className="task-row-actions"><StatusBadge status={task.status}/><small>{shortDate(task.updatedAt)}</small></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state dashboard-empty-state"><FileText size={27}/><h3>{currentRole === "member" ? "No tasks assigned to you yet" : "Start with one task"}</h3><p>{currentRole === "member" ? "When your owner assigns work, you can submit proof from the task page." : "Assign work to a teammate. Proof submissions and approvals will appear here."}</p>{currentRole === "owner" || isDemo ? <button className="button button-primary button-small" onClick={() => setModalOpen(true)}><Plus size={15}/> Assign a task</button> : <Link className="button button-primary button-small" href="/app/tasks?view=mine">View my tasks</Link>}</div>
            )}
          </section>

          <section className="panel dashboard-card dashboard-team-card">
            <div className="panel-heading dashboard-card-heading">
              <h2>Team</h2>
              {currentRole === "owner" ? <Link className="panel-link" href="/app/team">Manage team <ArrowRight size={15}/></Link> : <span className="member-count-label">{memberCount.toLocaleString("en-IN")} {memberCount === 1 ? "member" : "members"}</span>}
            </div>
            {members.length ? (
              <div className="member-list dashboard-member-list">
                {members.slice(0, 5).map((member) => (
                  <div className="member-row dashboard-member-row" key={member.id}>
                    <Avatar name={member.name} src={member.avatarSrc} size={36} />
                    <div className="dashboard-member-copy"><strong>{member.name}</strong><small>{member.role === "owner" ? "Workspace owner" : "Team member"}</small></div>
                    <span className={`member-role ${member.role === "owner" ? "owner-role" : ""}`}>{member.role === "owner" ? "Owner" : "Member"}</span>
                  </div>
                ))}
              </div>
            ) : <div className="dashboard-team-empty"><UsersRound size={22}/><p>Your team members appear here after a workspace is set up.</p><Link href="/app/team" className="panel-link">Set up team <ArrowRight size={14}/></Link></div>}
          </section>
        </div>

        <aside className="dashboard-side-column">
          <section className="panel dashboard-card dashboard-attention-card">
            <div className="panel-heading dashboard-card-heading">
              <h2>Needs attention {attention.length > 0 ? <span className="heading-count">{attention.length}</span> : null}</h2>
              <Link href={currentRole === "owner" ? "/app/reviews" : "/app/tasks?view=submit"} className="panel-link">View all <ArrowRight size={15}/></Link>
            </div>
            {attention.length ? (
              <div className="dashboard-attention-list">
                {attention.map((task) => (
                  <Link href={`/app/tasks/${task.id}`} className="attention-item dashboard-attention-item" key={task.id}>
                    <span className={`attention-icon ${task.status === "submitted" ? "attention-review" : "attention-changes"}`}>
                      {task.status === "submitted" ? <ClipboardCheck size={17}/> : <FileText size={17}/>}
                    </span>
                    <span className="dashboard-attention-copy"><strong>{task.title}</strong><span>{task.status === "submitted" ? `Proof from ${task.assigneeName} is ready for review.` : `${task.assigneeName} needs to update this task.`}</span><small>{task.status === "submitted" ? "Awaiting review" : "Changes requested"}</small></span>
                    <ArrowRight size={15} className="dashboard-attention-arrow" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-all-caught-up"><span><CheckCheck size={20}/></span><strong>All caught up</strong><p>No items need your attention.</p></div>
            )}
            <div className="dashboard-card-footer"><Link href={currentRole === "owner" ? "/app/reviews" : "/app/tasks?view=submit"} className="panel-link">{currentRole === "owner" ? "Open review inbox" : "Review my tasks"}<ArrowRight size={14}/></Link></div>
          </section>

          <section className="panel dashboard-card dashboard-workflow-card">
            <div className="panel-heading dashboard-card-heading">
              <h2>Task pipeline</h2>
              <Link href={currentRole === "owner" ? "/app/tasks" : "/app/tasks?view=mine"} className="panel-link">Manage tasks <ArrowRight size={15}/></Link>
            </div>
            {statusTotal ? <>
              <div className="pipeline-summary"><span>{taskLabel}</span></div>
              <div className="pipeline-stacked-bar" role="img" aria-label={`${taskLabel}. ${nonZeroStatuses.map((item) => `${item.count} ${item.label}`).join(", ")}`}>
                {nonZeroStatuses.map((item) => <span key={item.status} className={`pipeline-segment ${item.className}`} style={{ width: `${(item.count / statusTotal) * 100}%` }} title={`${item.label}: ${item.count}`} />)}
              </div>
              <div className="workflow-chart pipeline-label-list">
                {nonZeroStatuses.map((item) => (
                  <div className="workflow-chart-row" key={item.status}>
                    <div className="workflow-chart-label"><span className={`workflow-dot ${item.className}`} aria-hidden="true"/><span>{item.label}</span><strong>{item.count.toLocaleString("en-IN")}</strong></div>
                  </div>
                ))}
              </div>
            </> : <div className="pipeline-empty"><ListTodo size={24}/><strong>No task statuses yet</strong><span>Your task pipeline will appear here.</span></div>}
          </section>

          <section className="dashboard-brand-stamp" aria-label="Greenstamp approval mark">
            <span className="stamp-mark"><CheckCircle2 size={22}/></span>
            <span><strong>Proof. Review. Approved.</strong><small>Clear handoffs, in one workspace.</small></span>
          </section>
        </aside>
      </div>

      {isDemo ? <p className="form-hint dashboard-demo-note">Sample workspace: preview changes stay in this browser only.</p> : null}
      {modalOpen ? <TaskCreateModal onClose={() => setModalOpen(false)} onDemoCreate={(task) => { updateTasks((current) => [task, ...current]); setModalOpen(false); }} members={members} teamId={teamId} isDemo={isDemo}/> : null}
    </>
  );
}
