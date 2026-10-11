import type { Metadata } from "next";
import { JoinInviteView } from "@/components/workspace/join-invite-view";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Join a team", robots: { index: false, follow: false } };
export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const validPreviewToken = token === "preview-invite" || /^[A-Za-z0-9_-]{20,200}$/.test(token);
  return <JoinInviteView token={validPreviewToken ? token : "invalid"} isDemo={!isSupabaseConfigured()} />;
}
