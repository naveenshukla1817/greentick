"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Link2, Plus, UsersRound } from "lucide-react";
import type { WorkspaceData } from "@/lib/workspace-shared";
import { createClient } from "@/lib/supabase/client";

type ActionState = { error?: string; success?: string };

export function TeamView({ workspace }: { workspace: WorkspaceData }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [days, setDays] = useState("7");
  const [maxUses, setMaxUses] = useState("10");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<ActionState>({});
  const [previewInvite, setPreviewInvite] = useState("");

  async function createTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreatingTeam(true); setInviteMessage({});
    if (workspace.isDemo) { setInviteMessage({ error: "Team creation is only available after connecting Supabase." }); setCreatingTeam(false); return; }
    try {
      const supabase = createClient();
      const baseSlug = teamName.trim().toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52);
      const slug = baseSlug ? `${baseSlug}-${crypto.randomUUID().slice(0, 6)}` : null;
      const { error } = await supabase.rpc("create_team", { p_name: teamName.trim(), p_description: teamDescription.trim() || null, p_slug: slug });
      if (error) throw error;
      router.refresh();
    } catch (error) { setInviteMessage({ error: error instanceof Error ? error.message : "Could not create your team." }); }
    finally { setCreatingTeam(false); }
  }

  async function createInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setInviteMessage({});
    if (!workspace.teamId || workspace.isDemo) {
      const token = `preview-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
      const url = `${window.location.origin}/join/${token}`;
      setPreviewInvite(url);
      setInviteMessage({ success: `Preview link created. It expires in ${days} day(s) and is configured for ${maxUses} use(s), but will not add a real member.` });
      return;
    }
    try {
      const supabase = createClient();
      const { data: token, error } = await supabase.rpc("create_team_invite", {
        p_team_id: workspace.teamId,
        p_ttl_hours: Number(days) * 24,
        p_max_uses: Number(maxUses),
        p_invited_email: inviteEmail.trim().toLowerCase() || null,
      });
      if (error) throw error;
      if (typeof token !== "string" || !token) throw new Error("The invite was created but no token was returned.");
      setPreviewInvite(`${window.location.origin}/join/${token}`);
      setInviteMessage({ success: "Secure invite link created. Copy it and share it with your teammate; invite emails are not sent automatically yet." });
    } catch (error) { setInviteMessage({ error: error instanceof Error ? error.message : "Could not create the invitation." }); }
  }

  async function copyInvite() {
    if (!previewInvite) return;
    try { await navigator.clipboard.writeText(previewInvite); setInviteMessage({ success: "Invite link copied." }); }
    catch { setInviteMessage({ error: "Clipboard access was blocked. Select and copy the link manually." }); }
  }

  if (!workspace.isDemo && !workspace.teamId) return <>
    <div className="page-title-row"><div><h1>Create your team</h1><p>Set up a shared space before assigning work.</p></div></div>
    <section className="panel" style={{ maxWidth: 720 }}><div className="panel-heading"><div><h2>Your first workspace</h2><p>You’ll become its owner and can invite teammates.</p></div><UsersRound size={20} color="#1b5e3b"/></div><form className="inline-form" style={{ paddingTop: 4 }} onSubmit={createTeam}><div className="form-field"><label htmlFor="team-name">Team name</label><input id="team-name" required minLength={2} maxLength={80} value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Studio North" /></div><div className="form-field"><label htmlFor="team-description">Description <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><textarea id="team-description" maxLength={3000} value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} placeholder="What does your team work on?" /></div>{inviteMessage.error ? <p className="form-error" role="alert">{inviteMessage.error}</p> : null}<button className="button button-primary" type="submit" disabled={creatingTeam}><Plus size={15}/>{creatingTeam ? "Creating…" : "Create team"}</button></form></section>
  </>;

  return <>
    <div className="page-title-row"><div><h1>Team</h1><p>Manage membership and invitations.</p></div><span className="demo-chip">{workspace.memberCount}{workspace.isDemo ? " sample" : " active"} members</span></div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-heading"><div><h2>{workspace.teamName}</h2><p>Team workspace and roles</p></div><UsersRound size={20} color="#1b5e3b"/></div><div className="member-list">{workspace.members.map((member) => <div key={member.id} className="member-row"><span className="member-avatar">{member.name.split(/\s+/).map((part) => part[0]).slice(0,2).join("").toUpperCase()}</span><div><strong>{member.name}</strong><small>{member.role === "owner" ? "Can assign, invite and review" : "Can complete assigned tasks"}</small></div><span className="member-role">{member.role}</span></div>)}</div>{workspace.isDemo ? <div className="cookie-inline">These are sample people for the UI preview. Changes here do not alter real membership.</div> : null}</section>
      <section className="panel"><div className="panel-heading"><div><h2>Invite people</h2><p>Create a controlled, time-limited invitation link.</p></div><Link2 size={19} color="#1b5e3b"/></div>
        {workspace.currentRole === "owner" || workspace.isDemo ? <form className="inline-form" style={{ paddingTop: 4 }} onSubmit={createInvite}><div className="form-field"><label htmlFor="invite-email">Restrict to email <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label><input id="invite-email" type="email" maxLength={254} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@company.com" /></div><div className="modal-two-col"><div className="form-field"><label htmlFor="invite-days">Expires after</label><select id="invite-days" value={days} onChange={(e) => setDays(e.target.value)}><option value="1">1 day</option><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option></select></div><div className="form-field"><label htmlFor="invite-max">Maximum uses</label><select id="invite-max" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}><option value="1">1 use</option><option value="5">5 uses</option><option value="10">10 uses</option><option value="25">25 uses</option><option value="100">100 uses</option></select></div></div><button className="button button-primary" type="submit">Generate invite link <Plus size={15}/></button>{inviteMessage.error ? <p className="form-error" role="alert">{inviteMessage.error}</p> : null}{inviteMessage.success ? <p className="form-success" role="status">{inviteMessage.success}</p> : null}{previewInvite ? <div className="form-field"><label htmlFor="invite-url">Invite link</label><input id="invite-url" readOnly value={previewInvite}/><button className="button button-secondary button-small" type="button" onClick={() => void copyInvite()}><Copy size={14}/> Copy link</button></div> : null}</form> : <p className="form-hint">Only the team owner can create invitations.</p>}
      </section>
    </div>
    <div style={{ marginTop: 24 }}><Link href="/app/tasks" className="panel-link">Go to tasks →</Link></div>
  </>;
}
