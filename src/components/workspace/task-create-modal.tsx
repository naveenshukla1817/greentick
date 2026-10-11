"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCheck } from "lucide-react";
import type { Task, WorkspaceMember } from "@/lib/workspace-shared";
import { createClient } from "@/lib/supabase/client";

type FormMessage = { error?: string; success?: string };

export function TaskCreateModal({ onClose, onDemoCreate, members, teamId, isDemo }: {
  onClose: () => void;
  onDemoCreate?: (task: Task) => void;
  members: WorkspaceMember[];
  teamId?: string | null;
  isDemo: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<FormMessage>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(members.find((member) => member.role === "member")?.id || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueAt, setDueAt] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage({});
    if (title.trim().length < 2 || title.trim().length > 160 || !assigneeId) {
      setMessage({ error: "Add a title between 2 and 160 characters and choose a team member." }); setPending(false); return;
    }
    const dueDate = dueAt ? new Date(`${dueAt}T17:00:00`).toISOString() : null;
    if (isDemo) {
      const member = members.find((item) => item.id === assigneeId);
      const now = new Date().toISOString();
      onDemoCreate?.({ id: `demo-${Date.now()}`, teamId: teamId || "demo-team", title: title.trim(), description: description.trim(), status: "assigned", priority, assigneeName: member?.name || "Team member", assigneeId, dueAt: dueDate, updatedAt: now });
      setMessage({ success: "Task added to this browser preview." }); setPending(false); onClose(); return;
    }
    if (!teamId) { setMessage({ error: "Create a team before assigning tasks." }); setPending(false); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("create_task", {
        p_team_id: teamId,
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_assignee_id: assigneeId,
        p_priority: priority,
        p_due_at: dueDate,
        p_proof_required: true,
      });
      if (error) throw error;
      router.refresh();
      onClose();
    } catch (error) {
      setMessage({ error: error instanceof Error ? error.message : "Could not create the task. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-header"><div><h2 id="task-modal-title">Assign a task</h2><p>Give one teammate a clear outcome and deadline.</p></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={17}/></button></div>
      <div className="modal-body"><form className="modal-form" onSubmit={submit}>
        <div className="form-field"><label htmlFor="task-title">Task title</label><input id="task-title" autoFocus required minLength={2} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Export homepage assets" /></div>
        <div className="form-field"><label htmlFor="task-description">Description <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><textarea id="task-description" maxLength={10000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does a good result look like?" /></div>
        <div className="modal-two-col"><div className="form-field"><label htmlFor="task-assignee">Assign to</label><select id="task-assignee" required value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}><option value="" disabled>Select a teammate</option>{members.map((member) => <option value={member.id} key={member.id}>{member.name}{member.role === "owner" ? " (owner)" : ""}</option>)}</select></div><div className="form-field"><label htmlFor="task-priority">Priority</label><select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div>
        <div className="form-field"><label htmlFor="task-due">Due date <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><input id="task-due" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></div>
        {message.error ? <p className="form-error" role="alert">{message.error}</p> : null}{message.success ? <p className="form-success" role="status">{message.success}</p> : null}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 5 }}><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={pending || members.length === 0} type="submit"><CheckCheck size={15}/>{pending ? "Saving…" : "Create task"}</button></div>
      </form></div>
    </section>
  </div>;
}
