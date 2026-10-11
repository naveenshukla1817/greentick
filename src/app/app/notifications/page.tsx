import type { Metadata } from "next";
import { getWorkspaceIdentity } from "@/lib/workspace-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { NotificationList, type NotificationItem } from "@/components/workspace/notification-list";

export const metadata: Metadata = { title: "Notifications", alternates: { canonical: "/app/notifications" }, robots: { index: false, follow: false } };
const demoNotifications: NotificationItem[] = [
  { id: "demo-notice-1", type: "proof_submitted", title: "Proof is ready to review", body: "Priya submitted Homepage direction — v2.", created_at: "2026-10-09T15:10:00+05:30", read_at: null, entity_type: "task", entity_id: "demo-1" },
  { id: "demo-notice-2", type: "task_assigned", title: "Task still needs a start", body: "Customer interview notes is assigned to Arjun Rao.", created_at: "2026-10-08T12:15:00+05:30", read_at: null, entity_type: "task", entity_id: "demo-4" },
  { id: "demo-notice-3", type: "proof_approved", title: "Task approved", body: "Landing page design was approved by the team owner.", created_at: "2026-10-08T10:24:00+05:30", read_at: "2026-10-08T10:40:00+05:30", entity_type: "task", entity_id: "demo-5" },
];
export default async function NotificationsPage() {
  if (!isSupabaseConfigured()) return <NotificationList initialItems={demoNotifications} userId="demo-owner" isDemo />;
  const workspace = await getWorkspaceIdentity();
  const supabase = await createClient();
  const { data, error } = await supabase.from("notifications")
    .select("id, type, title, body, read_at, created_at, entity_type, entity_id")
    .eq("user_id", workspace.currentUserId).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(`Could not load notifications: ${error.message}`);
  return <NotificationList initialItems={(data || []) as NotificationItem[]} userId={workspace.currentUserId} isDemo={false} />;
}
