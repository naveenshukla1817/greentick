import type { Metadata } from "next";
import { getWorkspaceShellData } from "@/lib/workspace-data";
import { SettingsView } from "@/components/workspace/settings-view";

export const metadata: Metadata = { title: "Settings", alternates: { canonical: "/app/settings" }, robots: { index: false, follow: false } };
export default async function SettingsPage() {
  const workspace = await getWorkspaceShellData();
  return <SettingsView displayName={workspace.currentUserName} email={workspace.currentUserEmail} userId={workspace.currentUserId} isDemo={workspace.isDemo} />;
}
