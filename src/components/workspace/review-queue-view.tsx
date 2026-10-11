"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck, MessageSquareText } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/workspace-shared";
import { shortDate } from "@/lib/workspace-shared";
import { useDemoTasks } from "@/lib/use-demo-tasks";
import { StatusBadge } from "@/components/workspace/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type ActionState = { error?: string; success?: string };

export function ReviewQueueView({ initialTasks, isDemo, currentRole }: { initialTasks: Task[]; isDemo: boolean; currentRole: "owner" | "member" }) {
  const router = useRouter();
  const { tasks, updateTasks } = useDemoTasks(initialTasks, isDemo);
  const [commentByTask, setCommentByTask] = useState<Record<string,string>>({});
  const [message, setMessage] = useState<{ taskId: string; state: ActionState } | null>(null);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const queue = tasks.filter((task) => task.status === "submitted");

  async function decide(task: Task, decision: "approved" | "changes_requested") {
    setMessage(null);
    const comment = commentByTask[task.id]?.trim() || "";
    if (decision === "changes_requested" && comment.length < 3) { setMessage({ taskId: task.id, state: { error: "Add a short note explaining what needs to change." } }); return; }
    if (!isDemo && !task.latestSubmissionId) { setMessage({ taskId: task.id, state: { error: "No submission ID was found for this task. Refresh and try again." } }); return; }
    setPendingTask(task.id);
    try {
      if (!isDemo) {
        if (currentRole !== "owner") throw new Error("Only the team owner can review submissions.");
        const supabase = createClient();
        const { error } = await supabase.rpc("review_submission", {
          p_submission_id: task.latestSubmissionId!, p_decision: decision, p_comment: comment || null,
        });
        if (error) throw error;
      }
      updateTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: decision as TaskStatus, updatedAt: new Date().toISOString() } : item));
      setMessage({ taskId: task.id, state: { success: isDemo ? (decision === "approved" ? "Marked approved in this preview." : "Changes requested in this preview.") : (decision === "approved" ? "Proof approved and the member has been notified." : "Changes requested. The member has been notified.") } });
      if (!isDemo) router.refresh();
    } catch (error) {
      setMessage({ taskId: task.id, state: { error: error instanceof Error ? error.message : "Could not save the review." } });
    } finally { setPendingTask(null); }
  }

  return <>
    <div className="page-title-row"><div><h1>Review inbox</h1><p>Review each submission and leave the decision attached to the work.</p></div><span className="demo-chip">{queue.length} awaiting review</span></div>
    {currentRole !== "owner" && !isDemo ? <div className="cookie-inline">Your role is Member. Review actions are available to the team owner.</div> : null}
    <div className="content-panel">
      {queue.length ? queue.map((task) => <article key={task.id} style={{ padding: "21px 0", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, flexWrap: "wrap" }}><div><Link href={`/app/tasks/${task.id}`} className="task-name" style={{ fontSize: 15 }}>{task.title}</Link><div className="task-meta"><Avatar name={task.assigneeName} size={27}/><span>{task.assigneeName}</span><span className="separator"/><span>Submitted {shortDate(task.updatedAt)}</span><span className="separator"/><span>{task.priority} priority</span></div></div><StatusBadge status={task.status}/></div>
        <p style={{ margin: "14px 0 17px", color: "var(--muted)", fontSize: 13, maxWidth: 700 }}>{task.latestSubmissionNote || task.description || "No note was included with this submission."}</p>
        {task.latestSubmissionFiles?.length ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>{task.latestSubmissionFiles.map((file) => <a key={file.id} className="button button-secondary button-small" href={file.url} target="_blank" rel="noreferrer">{file.name} ↗</a>)}</div> : null}
        {isDemo ? <div className="cookie-inline" style={{ marginTop: 0, marginBottom: 16 }}>Sample evidence preview: uploaded files are not sent to a server.</div> : null}
        {currentRole === "owner" || isDemo ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "end", gap: 14 }}><div className="form-field"><label htmlFor={`review-note-${task.id}`}>Review note <span style={{ color: "var(--muted)", fontWeight: 400 }}>(required when requesting changes)</span></label><textarea id={`review-note-${task.id}`} rows={2} value={commentByTask[task.id] || ""} onChange={(e) => setCommentByTask((current) => ({ ...current, [task.id]: e.target.value }))} placeholder="What should be updated?" style={{ minHeight: 68 }}/></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="button button-primary button-small" type="button" disabled={pendingTask === task.id} onClick={() => void decide(task, "approved")}><Check size={14}/> Approve</button><button className="button button-secondary button-small" type="button" disabled={pendingTask === task.id} onClick={() => void decide(task, "changes_requested")}><MessageSquareText size={14}/> Request changes</button></div></div> : null}
        {message?.taskId === task.id ? <p className={message.state.error ? "form-error" : "form-success"} role={message.state.error ? "alert" : "status"} style={{ marginTop: 12 }}>{message.state.error || message.state.success}</p> : null}
      </article>) : <div className="empty-state"><ClipboardCheck size={26}/><h3>Nothing waiting for review</h3><p>When someone submits proof, it will land here so the decision can happen quickly.</p><Link href="/app/tasks" className="button button-secondary button-small">View all tasks</Link></div>}
    </div>
    {isDemo ? <p className="form-hint" style={{ marginTop: 14 }}>Preview mode: approvals and change requests are saved in this browser only.</p> : null}
  </>;
}
