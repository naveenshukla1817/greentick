"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCheck, ClipboardCheck, FileText, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type NotificationItem = { id: string; type: string; title: string; body: string; read_at?: string | null; created_at: string; entity_type?: string | null; entity_id?: string | null };
const READ_KEY = "greenstamp_demo_notifications_read_v1";

export function NotificationList({ initialItems, userId, isDemo }: { initialItems: NotificationItem[]; userId: string; isDemo: boolean }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  async function markRead(id: string) {
    const now = new Date().toISOString();
    setError("");
    if (!isDemo) {
      const supabase = createClient();
      const { error: updateError } = await supabase.from("notifications").update({ read_at: now }).eq("id", id).eq("user_id", userId);
      if (updateError) { setError(updateError.message); return; }
    }
    const next = items.map((item) => item.id === id ? { ...item, read_at: now } : item);
    setItems(next);
    if (isDemo) {
      try { window.localStorage.setItem(READ_KEY, JSON.stringify(next.filter((item) => item.read_at).map((item) => item.id))); } catch { /* Preview still works in memory. */ }
    }
  }
  const Icon = (type: string) => type.includes("review") || type.includes("proof") ? ClipboardCheck : type.includes("member") || type.includes("invite") ? UsersRound : type.includes("task") ? FileText : Bell;
  return <>
    <div className="page-title-row"><div><h1>Notifications</h1><p>Updates that help the team know what needs attention.</p></div><span className="demo-chip">{items.filter((item) => !item.read_at).length} unread</span></div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <div className="content-panel">{items.length ? items.map((item) => { const ItemIcon = Icon(item.type); return <article className={`task-row notification-row${item.read_at ? "" : " notification-unread"}`} key={item.id} style={{ paddingInline: 12 }}><div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}><div className="attention-icon"><ItemIcon size={15}/></div><div><strong className="task-name">{item.title}</strong><p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 12 }}>{item.body}</p><small style={{ display: "block", marginTop: 6, color: "var(--muted)", fontSize: 10 }}>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</small>{item.entity_type === "task" && item.entity_id ? <Link href={`/app/tasks/${item.entity_id}`} className="panel-link" style={{ display: "inline-block", marginTop: 7 }}>Open task →</Link> : null}</div></div>{!item.read_at ? <button className="button button-secondary button-small" type="button" onClick={() => void markRead(item.id)}>Mark read</button> : <span className="form-hint"><CheckCheck size={13} style={{ display: "inline", verticalAlign: "-2px" }}/> Read</span>}</article>; }) : <div className="empty-state"><Bell size={24}/><h3>You’re all caught up</h3><p>New assignments, submissions, and review decisions will appear here.</p></div>}</div>
    {isDemo ? <p className="form-hint" style={{ marginTop: 14 }}>Sample notifications are for interface preview only.</p> : null}
  </>;
}
