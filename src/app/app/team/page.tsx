import type { Metadata } from "next";
import { getWorkspaceData } from "@/lib/workspace-data";
import { TeamView } from "@/components/workspace/team-view";

export const metadata: Metadata = { title: "Team", alternates: { canonical: "/app/team" }, robots: { index: false, follow: false } };
export default async function TeamPage() { const workspace = await getWorkspaceData(false); return <TeamView workspace={workspace}/>; }
