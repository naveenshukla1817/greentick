"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ArrowUpRight, CalendarDays, FilePlus2, Plus, Search } from "lucide-react";
import { useDemoTasks } from "@/lib/use-demo-tasks";
import type { Task, TaskStatus, WorkspaceMember } from "@/lib/workspace-shared";
import { shortDate } from "@/lib/workspace-shared";
import { StatusBadge } from "@/components/workspace/status-badge";
import { TaskCreateModal } from "@/components/workspace/task-create-modal";

const filters: Array<{ value: "all" | TaskStatus; label: string }> = [
  { value: "all", label: "All tasks" }, { value: "assigned", label: "Assigned" }, { value: "in_progress", label: "In progress" }, { value: "submitted", label: "Awaiting review" }, { value: "changes_requested", label: "Changes requested" }, { value: "approved", label: "Approved" },
];

export function TaskListView({ initialTasks, members, teamId, isDemo, canCreate = true, currentRole = "owner", currentUserId, view = "all" }: { initialTasks: Task[]; members: WorkspaceMember[]; teamId?: string | null; isDemo: boolean; canCreate?: boolean; currentRole?: "owner" | "member"; currentUserId?: string; view?: "all" | "mine" | "submit" }) {
  const { tasks, updateTasks } = useDemoTasks(initialTasks, isDemo);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const scopedTasks = useMemo(() => {
    if (currentRole !== "member") return tasks;
    if (view === "submit") return tasks.filter((task) => task.assigneeId === currentUserId && ["assigned", "in_progress", "changes_requested", "submitted"].includes(task.status));
    return tasks.filter((task) => task.assigneeId === currentUserId);
  }, [tasks, currentRole, currentUserId, view]);
  const filtered = useMemo(() => scopedTasks.filter((task) => (filter === "all" || task.status === filter) && `${task.title} ${task.assigneeName}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)), [scopedTasks, filter, query]);
  const pageTitle = currentRole === "member" ? view === "submit" ? "Submit proof" : "My tasks" : "Tasks";
  const pageDescription = view === "submit" ? "Open an assigned task to upload proof for review." : currentRole === "member" ? "Your assigned work, deadlines, and review status." : "Manage task ownership, deadlines, and review status.";

  return <>
    <div className="page-title-row"><div><h1>{pageTitle}</h1><p>{pageDescription}</p></div>{canCreate ? <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={16}/> Assign a task</button> : null}</div>
    <div className="content-panel">
      <div className="filter-bar">
        <div className="filter-tabs" role="tablist" aria-label="Filter tasks">{filters.map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} className={`filter-tab ${filter === item.value ? "active" : ""}`} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
        <label className="search-field"><Search size={15}/><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></label>
      </div>
      {filtered.length ? <div className="task-table" role="list" aria-label="Tasks">
        {filtered.map((task) => <article className="task-row" key={task.id} role="listitem">
          <div className="task-list-primary"><Link href={`/app/tasks/${task.id}`} className="task-name">{task.title} <ArrowUpRight size={13} style={{ display: "inline", verticalAlign: "-2px" }}/></Link><div className="task-meta"><Avatar name={task.assigneeName} src={task.assigneeId === currentUserId ? "/avatars/default.png" : undefined} size={24}/><span>{task.assigneeName}</span><span className="separator"/><span>{task.priority[0].toUpperCase() + task.priority.slice(1)} priority</span><span className="separator"/><span><CalendarDays size={13} style={{ display: "inline", verticalAlign: "-2px" }}/> {shortDate(task.dueAt)}</span></div></div>
          <div className="task-row-actions"><StatusBadge status={task.status}/><small>Updated {shortDate(task.updatedAt)}</small></div>
        </article>)}
      </div> : <div className="empty-state"><FilePlus2 size={26}/><h3>No tasks found</h3><p>{query ? "Try a different search or status filter." : view === "submit" ? "No assigned task is ready for proof submission right now." : currentRole === "member" ? "Tasks assigned to you will appear here." : "Tasks that match this filter will appear here."}</p>{canCreate && !query && filter === "all" ? <button className="button button-secondary button-small" onClick={() => setModalOpen(true)}>Assign the first task</button> : null}</div>}
    </div>
    {isDemo ? <p className="form-hint" style={{ marginTop: 14 }}>Preview mode: tasks created or reviewed here are saved in this browser only.</p> : null}
    {modalOpen ? <TaskCreateModal onClose={() => setModalOpen(false)} onDemoCreate={(task) => { updateTasks((current) => [task, ...current]); setModalOpen(false); }} members={members} teamId={teamId} isDemo={isDemo}/> : null}
  </>;
}
