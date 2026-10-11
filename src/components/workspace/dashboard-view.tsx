"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ListTodo,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { Task, TaskStatus, WorkspaceMember } from "@/lib/workspace-shared";
import { shortDate } from "@/lib/workspace-shared";
import { useDemoTasks } from "@/lib/use-demo-tasks";
import { StatusBadge } from "@/components/workspace/status-badge";
import { TaskCreateModal } from "@/components/workspace/task-create-modal";

const statusOrder: Array<{ status: TaskStatus; label: string; className: string }> = [
  { status: "assigned", label: "Assigned", className: "workflow-bar-assigned" },
  { status: "in_progress", label: "In progress", className: "workflow-bar-progress" },
  { status: "submitted", label: "Awaiting review", className: "workflow-bar-review" },
  { status: "changes_requested", label: "Changes requested", className: "workflow-bar-changes" },
  { status: "approved", label: "Approved", className: "workflow-bar-approved" },
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
};

export function DashboardView({
  initialTasks,
  members,
  teamId,
  teamName,
  memberCount,
  isDemo,
  userName,
  currentRole,
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
  const completion = tasks.length ? Math.round((counts.approved / tasks.length) * 100) : 0;
  const metrics = [
    { label: "Open tasks", value: openCount, note: "need progress", icon: ListTodo, tone: "metric-featured" },
    { label: "Awaiting review", value: counts.submitted, note: "proofs to review", icon: ClipboardCheck, tone: "metric-review" },
    { label: "Approved", value: counts.approved, note: "signed off", icon: CheckCircle2, tone: "metric-approved" },
    { label: "Team members", value: memberCount, note: "in this workspace", icon: UsersRound, tone: "metric-members" },
  ];

  const attention = tasks
    .filter((task) => task.status === "submitted" || task.status === "changes_requested" || task.status === "assigned")
    .sort((a, b) => {
      const rank = (task: Task) => task.status === "submitted" ? 0 : task.status === "changes_requested" ? 1 : 2;
      return rank(a) - rank(b);
    })
    .slice(0, 4);
  const recent = tasks.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const maxStatusCount = Math.max(1, ...Object.values(counts));

  return (
    <>
      <div className="dashboard-welcome-row">
        <div>
          <div className="dashboard-eyebrow"><span className="dashboard-eyebrow-dot" /> WORKSPACE OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Plan, track, and prove progress across {teamName}.</p>
        </div>
        <div className="dashboard-title-actions">
          <Link href="/app/reviews" className="button button-secondary dashboard-secondary-action"><ClipboardCheck size={16} /> Review inbox</Link>
          {!teamId && !isDemo ? (
            <Link href="/app/team" className="button button-primary"><Plus size={16} /> Create a team</Link>
          ) : (isDemo || currentRole === "owner") ? (
            <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Assign task</button>
          ) : null}
        </div>
      </div>

      {!teamId && !isDemo ? (
        <div className="cookie-inline dashboard-setup-notice" style={{ marginBottom: 22 }}>
          <strong>Set up your team.</strong> Create a team or join one using an invite link to start assigning work. <Link href="/app/team" className="text-link">Open team setup →</Link>
        </div>
      ) : null}

      <div className="dashboard-metrics" aria-label="Workspace summary">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <article className={`metric dashboard-metric-card ${metric.tone}`} key={metric.label}>
              <div className="dashboard-metric-top">
                <span className="metric-label">{metric.label}</span>
                <span className="dashboard-metric-icon"><Icon size={17} strokeWidth={1.8} /></span>
              </div>
              <div className="metric-value">{metric.value}</div>
              <div className="dashboard-metric-foot">
                <span className="dashboard-metric-indicator"><Activity size={12} /> {metric.note}</span>
                {index === 0 ? <span className="dashboard-metric-arrow"><ArrowUpRight size={15} /></span> : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <section className="panel dashboard-card dashboard-recent-card">
            <div className="panel-heading dashboard-card-heading">
              <div><span className="panel-kicker">LATEST ACTIVITY</span><h2>Recently updated</h2><p>The latest movement across your team’s tasks.</p></div>
              <Link href="/app/tasks" className="panel-link dashboard-view-all">All tasks <ArrowRight size={14} /></Link>
            </div>
            {recent.length ? (
              <div className="task-table dashboard-task-table">
                {recent.map((task) => (
                  <article key={task.id} className="task-row dashboard-task-row">
                    <span className={`dashboard-task-symbol ${task.status === "approved" ? "is-approved" : task.status === "submitted" ? "is-review" : task.status === "changes_requested" ? "is-changes" : "is-open"}`}>
                      {task.status === "approved" ? <CheckCheck size={16} /> : task.status === "submitted" ? <ClipboardCheck size={16} /> : task.status === "changes_requested" ? <FileText size={16} /> : <ListTodo size={16} />}
                    </span>
                    <div className="dashboard-task-copy">
                      <Link href={`/app/tasks/${task.id}`} className="task-name">{task.title}</Link>
                      <div className="task-meta"><span>{task.assigneeName}</span><span className="separator" /><span>Due {shortDate(task.dueAt)}</span></div>
                    </div>
                    <div className="task-row-actions"><StatusBadge status={task.status}/><small>Updated {shortDate(task.updatedAt)}</small></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state dashboard-empty-state"><FileText size={24}/><h3>Your first task starts here</h3><p>Create a task and assign it to a teammate. Submissions and approvals will show up in this overview.</p>{!teamId && !isDemo ? <Link className="button button-primary button-small" href="/app/team">Create a team</Link> : (isDemo || currentRole === "owner") ? <button className="button button-primary button-small" onClick={() => setModalOpen(true)}>Assign a task</button> : null}</div>
            )}
          </section>

          <div className="dashboard-lower-grid">
            <section className="panel dashboard-card dashboard-workflow-card">
              <div className="panel-heading dashboard-card-heading">
                <div><span className="panel-kicker">WORKFLOW</span><h2>Task pipeline</h2><p>Where work stands right now.</p></div>
                <span className="dashboard-heading-icon dashboard-icon-cyan"><Activity size={17}/></span>
              </div>
              <div className="workflow-chart">
                {statusOrder.map((item) => {
                  const count = tasks.filter((task) => task.status === item.status).length;
                  const width = tasks.length ? Math.max(count > 0 ? 7 : 0, (count / maxStatusCount) * 100) : 0;
                  return (
                    <div className="workflow-chart-row" key={item.status}>
                      <div className="workflow-chart-label"><span className={`workflow-dot ${item.className}`} /> <span>{item.label}</span><strong>{count}</strong></div>
                      <div className="workflow-track"><span className={`workflow-bar ${item.className}`} style={{ width: `${width}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <div className="workflow-footer"><span>{tasks.length} total {tasks.length === 1 ? "task" : "tasks"}</span><Link href="/app/tasks">Manage pipeline <ArrowRight size={13}/></Link></div>
            </section>

            <section className="panel dashboard-card dashboard-team-card">
              <div className="panel-heading dashboard-card-heading">
                <div><span className="panel-kicker">YOUR PEOPLE</span><h2>Team collaboration</h2><p>{memberCount} {memberCount === 1 ? "member" : "members"} in {teamName}.</p></div>
                <span className="dashboard-heading-icon dashboard-icon-pink"><UsersRound size={17}/></span>
              </div>
              {members.length ? (
                <div className="member-list dashboard-member-list">
                  {members.slice(0, 4).map((member, index) => (
                    <div className="member-row dashboard-member-row" key={member.id}>
                      <span className={`member-avatar dashboard-member-avatar avatar-tone-${index % 4}`}>{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
                      <div className="dashboard-member-copy"><strong>{member.name}</strong><small>{member.role === "owner" ? "Workspace owner" : "Team member"}</small></div>
                      <span className={`member-role ${member.role === "owner" ? "owner-role" : ""}`}>{member.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-team-empty"><UsersRound size={21}/><p>Your team list will appear here once a team is set up.</p><Link href="/app/team" className="panel-link">Set up team <ArrowRight size={13}/></Link></div>
              )}
              <div className="dashboard-card-footer"><Link className="panel-link" href="/app/team">Manage team <ArrowRight size={13}/></Link></div>
            </section>
          </div>
        </div>

        <aside className="dashboard-side-column">
          <section className="panel dashboard-card dashboard-attention-card">
            <div className="panel-heading dashboard-card-heading">
              <div><span className="panel-kicker">NEXT ACTIONS</span><h2>Needs attention</h2><p>Items to move work forward.</p></div>
              <span className="dashboard-heading-icon dashboard-icon-green"><ClipboardCheck size={17}/></span>
            </div>
            {attention.length ? (
              <div className="dashboard-attention-list">
                {attention.map((task) => (
                  <Link href={`/app/tasks/${task.id}`} className="attention-item dashboard-attention-item" key={task.id}>
                    <span className={`attention-icon ${task.status === "submitted" ? "attention-review" : task.status === "changes_requested" ? "attention-changes" : "attention-assigned"}`}>
                      {task.status === "submitted" ? <ClipboardCheck size={15}/> : task.status === "changes_requested" ? <FileText size={15}/> : <CalendarClock size={15}/>}
                    </span>
                    <span className="dashboard-attention-copy"><strong>{task.title}</strong><span>{task.status === "submitted" ? `Proof from ${task.assigneeName} is ready to review.` : task.status === "changes_requested" ? `${task.assigneeName} needs to resubmit.` : `Still assigned to ${task.assigneeName}.`}</span><small>{task.status === "submitted" ? "Review proof" : task.status === "changes_requested" ? "Changes requested" : `Due ${shortDate(task.dueAt)}`}</small></span>
                    <ArrowUpRight size={14} className="dashboard-attention-arrow" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-all-caught-up"><span><CheckCheck size={20}/></span><strong>All caught up</strong><p>No task needs immediate attention.</p></div>
            )}
            <div className="dashboard-card-footer"><Link href="/app/reviews" className="panel-link">Open review inbox <ArrowRight size={13}/></Link></div>
          </section>

          <section className="panel dashboard-card dashboard-progress-card">
            <div className="panel-heading dashboard-card-heading">
              <div><span className="panel-kicker">MOMENTUM</span><h2>Approved work</h2><p>Share of tasks signed off.</p></div>
              <span className="dashboard-heading-icon dashboard-icon-lime"><Sparkles size={17}/></span>
            </div>
            <div className="dashboard-progress-layout">
              <div className="completion-ring" style={{ background: `conic-gradient(var(--green) ${completion}%, var(--progress-track) 0)` }} role="img" aria-label={`${completion}% of tasks approved`}>
                <div className="completion-ring-inner"><strong>{completion}%</strong><span>approved</span></div>
              </div>
              <div className="dashboard-progress-copy"><strong>{counts.approved} of {tasks.length}</strong><span>tasks approved</span><div className="dashboard-progress-caption"><CheckCircle2 size={13}/> Based on current task statuses</div></div>
            </div>
            <div className="dashboard-progress-footer"><span><i className="progress-legend-approved"/> Approved</span><span><i className="progress-legend-remaining"/> Remaining</span></div>
          </section>

          <section className="dashboard-quick-card">
            <div className="dashboard-quick-copy"><span className="dashboard-quick-icon"><Sparkles size={16}/></span><strong>Make progress visible</strong><p>Attach proof to a task, then send it to review.</p></div>
            <Link href="/app/tasks" className="dashboard-quick-link">Open tasks <ArrowRight size={14}/></Link>
          </section>
        </aside>
      </div>

      {isDemo ? <p className="form-hint dashboard-demo-note">You’re viewing a sample workspace. Changes in preview mode stay in this browser and are not shared with a team.</p> : null}
      {modalOpen ? <TaskCreateModal onClose={() => setModalOpen(false)} onDemoCreate={(task) => { updateTasks((current) => [task, ...current]); setModalOpen(false); }} members={members} teamId={teamId} isDemo={isDemo}/> : null}
    </>
  );
}
