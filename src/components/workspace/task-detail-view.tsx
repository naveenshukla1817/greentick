"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCheck, FilePlus2, Upload, X } from "lucide-react";
import { useDemoTasks } from "@/lib/use-demo-tasks";
import type { Task } from "@/lib/workspace-shared";
import { shortDate } from "@/lib/workspace-shared";
import { StatusBadge } from "@/components/workspace/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type ActionState = { error?: string; success?: string };
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export function TaskDetailView({ taskId, initialTasks, canSubmit, currentRole, isDemo, currentUserId }: { taskId: string; initialTasks: Task[]; canSubmit: boolean; currentRole: "owner" | "member"; isDemo: boolean; currentUserId: string }) {
  const router = useRouter();
  const { tasks, updateTasks, hydrated } = useDemoTasks(initialTasks, isDemo);
  const task = tasks.find((item) => item.id === taskId);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<ActionState>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const canWork = Boolean(task && canSubmit && (["assigned", "in_progress", "changes_requested"].includes(task.status) || (task.status === "submitted" && Boolean(task.latestSubmissionId))));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage({});
    if (!task) return;
    if (!files.length) { setMessage({ error: "Add at least one proof file." }); return; }
    if (files.length > 5) { setMessage({ error: "Choose up to five files." }); return; }
    const invalid = files.find((file) => !ALLOWED.has(file.type) || file.size <= 0 || file.size > MAX_BYTES);
    if (invalid) { setMessage({ error: `${invalid.name}: use JPG, PNG, WebP, or PDF files up to 5 MB each.` }); return; }
    setPending(true);
    try {
      if (isDemo) {
        updateTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "submitted", updatedAt: new Date().toISOString() } : item));
        setMessage({ success: `Proof noted in preview mode${note.trim() ? ` with your note: “${note.trim()}”` : ""}. No file was uploaded to a server.` });
      } else {
        if (!task.teamId) throw new Error("This task has no team attached. Refresh and try again.");
        const supabase = createClient();
        let submissionId = task.status === "submitted" ? task.latestSubmissionId : null;
        if (!submissionId) {
          const { data, error: submitError } = await supabase.rpc("submit_task_proof", { p_task_id: task.id, p_note: note.trim() || null });
          if (submitError) throw submitError;
          if (!data || typeof data !== "string") throw new Error("The submission was created without a valid ID. Refresh before retrying.");
          submissionId = data;
        }

        for (const file of files) {
          const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(-150) || "proof";
          const path = `${task.teamId}/${task.id}/${submissionId}/${crypto.randomUUID()}-${safeName}`;
          const { error: uploadError } = await supabase.storage.from("greenstamp-proofs").upload(path, file, { contentType: file.type, upsert: false });
          if (uploadError) throw new Error(`Submission was created, but ${file.name} could not be uploaded: ${uploadError.message}`);
          const { error: registerError } = await supabase.rpc("register_submission_file", {
            p_submission_id: submissionId, p_storage_path: path, p_file_name: file.name,
            p_mime_type: file.type, p_size_bytes: file.size,
          });
          if (registerError) {
            throw new Error(`Submission exists, but ${file.name} could not be registered: ${registerError.message}. You can retry by adding the file again.`);
          }
        }
        updateTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "submitted", updatedAt: new Date().toISOString(), latestSubmissionId: submissionId, latestSubmissionNote: item.status === "submitted" ? item.latestSubmissionNote : note.trim() || null } : item));
        setMessage({ success: task.status === "submitted" ? "Proof files added to the existing submission." : "Proof submitted to your team. The owner can review it now." });
        router.refresh();
      }
      setFiles([]); setNote(""); if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      setMessage({ error: error instanceof Error ? error.message : "Could not submit proof. Please try again." });
      if (!isDemo) router.refresh();
    } finally { setPending(false); }
  }

  async function startWork() {
    if (!task) return;
    setPending(true); setMessage({});
    try {
      if (isDemo) {
        updateTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "in_progress", updatedAt: new Date().toISOString() } : item));
        setMessage({ success: "Work started in this browser preview." });
      } else {
        const supabase = createClient();
        const { error } = await supabase.rpc("start_task", { p_task_id: task.id });
        if (error) throw error;
        updateTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "in_progress", updatedAt: new Date().toISOString() } : item));
        setMessage({ success: "Task started. Your team can see the status update." });
        router.refresh();
      }
    } catch (error) { setMessage({ error: error instanceof Error ? error.message : "Could not start the task." }); }
    finally { setPending(false); }
  }

  if (!task) return <>
    <div style={{ marginBottom: 21 }}><Link href="/app/tasks" className="panel-link"><ArrowLeft size={14} style={{ display: "inline", verticalAlign: "-2px" }}/> Back to tasks</Link></div>
    <div className="content-panel empty-state"><FilePlus2 size={26}/><h3>{hydrated ? "Task not found" : "Loading task…"}</h3><p>{hydrated ? "This task may have been removed or is not part of your team." : "Loading your workspace data."}</p></div>
  </>;

  return <>
    <div style={{ marginBottom: 21 }}><Link href="/app/tasks" className="panel-link"><ArrowLeft size={14} style={{ display: "inline", verticalAlign: "-2px" }}/> Back to tasks</Link></div>
    <div className="page-title-row"><div><div className="task-meta" style={{ margin: "0 0 8px" }}>TASK / {task.id.startsWith("demo-") ? "PREVIEW" : task.id.slice(0,8).toUpperCase()}</div><h1>{task.title}</h1><p>{task.description || "No task description was provided."}</p></div><StatusBadge status={task.status}/></div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-heading"><div><h2>Task details</h2><p>Ownership, priority and the next step.</p></div></div>
        <div className="task-table">
          <div className="task-row"><div><span className="task-meta" style={{ marginTop: 0 }}>Assigned to</span><span className="task-assignee-profile"><Avatar name={task.assigneeName} src={task.assigneeId === currentUserId ? "/avatars/default.png" : undefined} size={30}/><strong className="task-name">{task.assigneeName}</strong></span></div><span className="member-role">{task.priority.toUpperCase()} PRIORITY</span></div>
          <div className="task-row"><div><span className="task-meta" style={{ marginTop: 0 }}>Due date</span><strong className="task-name">{shortDate(task.dueAt)}</strong></div><CalendarDays size={17} color="#657565"/></div>
        </div>
        {task.status === "assigned" && canSubmit ? <div style={{ paddingTop: 18 }}><button className="button button-secondary button-small" disabled={pending} onClick={startWork}>Start work</button></div> : null}
        {task.latestSubmissionNote ? <div className="cookie-inline" style={{ marginTop: 16 }}><strong>Latest submission note:</strong> {task.latestSubmissionNote}</div> : null}
        {task.latestSubmissionFiles?.length ? <div style={{ marginTop: 14 }}><strong style={{ fontSize: 12 }}>Latest proof files</strong><div style={{ display: "grid", gap: 8, marginTop: 8 }}>{task.latestSubmissionFiles.map((file) => <a key={file.id} className="panel-link" href={file.url} target="_blank" rel="noreferrer">{file.name} ↗</a>)}</div></div> : null}
        {message.error ? <p className="form-error" role="alert" style={{ marginTop: 14 }}>{message.error}</p> : null}{message.success ? <p className="form-success" role="status" style={{ marginTop: 14 }}>{message.success}</p> : null}
        {isDemo ? <div className="cookie-inline">Preview mode: files and review history stay local to this UI preview.</div> : null}
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Submit proof</h2><p>Attach what you completed so the owner can review it.</p></div><FilePlus2 size={19} color="#1b5e3b"/></div>
        {canWork ? <form className="inline-form" style={{ paddingTop: 4 }} onSubmit={handleSubmit}>
          <div className="form-field"><label htmlFor="proof-files">Proof files</label><input ref={fileInput} id="proof-files" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} /><span className="form-hint">JPG, PNG, WebP or PDF. Up to 5 files, 5 MB each.</span></div>
          {files.length ? <div style={{ display: "grid", gap: 7 }}>{files.map((file) => <div key={`${file.name}-${file.size}`} className="proof-file-chip" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", fontSize: 12 }}><span>{file.name} <span style={{ color: "var(--muted)" }}>({(file.size / 1024).toFixed(0)} KB)</span></span><button className="icon-button" type="button" style={{ width: 27, height: 27 }} aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((item) => item !== file))}><X size={13}/></button></div>)}</div> : null}
          {task.status === "submitted" ? <p className="form-hint">This task already has a submission. You can add files if an upload was interrupted; the original note stays unchanged.</p> : <div className="form-field"><label htmlFor="proof-note">Note for the reviewer <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><textarea id="proof-note" rows={3} maxLength={10000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should the reviewer look at?"/></div>}
          <button className="button button-primary" disabled={pending} type="submit"><Upload size={15}/>{pending ? "Uploading…" : task.status === "submitted" ? "Add proof files" : "Submit for review"}</button>
        </form> : <div className="empty-state"><CheckCheck size={24}/><h3>{task.status === "approved" ? "This task is approved" : task.status === "submitted" ? "Proof is awaiting review" : "You cannot submit proof here"}</h3><p>{task.status === "approved" ? "The owner has signed off on this task." : task.status === "submitted" ? "The team owner will review the latest submission." : "Only the assigned member can submit proof for this task."}</p></div>}
      </section>
    </div>
    {currentRole === "owner" && task.status === "submitted" ? <div className="cookie-inline" style={{ marginTop: 24 }}>This submission is ready to review. <Link href="/app/reviews" className="text-link">Open the review inbox →</Link></div> : null}
  </>;
}
