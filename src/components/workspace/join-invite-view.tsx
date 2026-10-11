"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCheck, ShieldCheck, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ActionState = { error?: string; success?: string };

export function JoinInviteView({ token, isDemo }: { token: string; isDemo: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<ActionState>({});
  const invalid = token === "invalid";
  async function acceptInvite() {
    setPending(true); setMessage({});
    if (isDemo) { setMessage({ success: "Preview invite accepted in this browser session. No team membership was changed." }); setPending(false); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("accept_team_invite", { p_token: token });
      if (error) throw error;
      setMessage({ success: "You joined the team. Opening your workspace…" });
      router.refresh();
      window.setTimeout(() => router.replace("/app"), 700);
    } catch (error) { setMessage({ error: error instanceof Error ? error.message : "Could not accept this invitation." }); }
    finally { setPending(false); }
  }
  const loginUrl = `/login?next=${encodeURIComponent(`/join/${token}`)}`;
  return <main id="main-content" className="page-main"><div className="site-container" style={{ maxWidth: 720 }}><div className="prose"><div className="eyebrow"><span className="eyebrow-mark"/> Team invitation</div><h1>Join a team on Greenstamp.</h1><p className="lead">Accept this invitation to work from the same task list, submit proof, and keep review decisions connected to the work.</p></div><section className="content-panel" style={{ padding: 24, maxWidth: 560 }}><div style={{ display: "flex", gap: 13, alignItems: "center", paddingBottom: 17, borderBottom: "1px solid var(--line)" }}><span className="brand-mark" style={{ width: 42, height: 42 }}><CheckCheck size={21}/></span><div><h2 style={{ margin: 0, fontSize: 18 }}>Greenstamp team invite</h2><p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>Your access is based on the team's role and permissions.</p></div></div><ul className="check-list" style={{ marginBottom: 22 }}><li><UsersRound size={16}/> Collaborate with your team</li><li><CheckCheck size={16}/> Submit work and revisions</li><li><ShieldCheck size={16}/> Keep team proof private</li></ul>{invalid ? <p className="form-error" role="alert">This invitation link is malformed. Ask the team owner for a new one.</p> : null}{message.error ? <p className="form-error" role="alert">{message.error}</p> : null}{message.success ? <p className="form-success" role="status">{message.success}</p> : null}{!isDemo ? <p className="form-hint">You must be signed in with the invited email address, if this invite was email-restricted.</p> : null}<button className="button button-primary" type="button" onClick={() => void acceptInvite()} disabled={invalid || pending || Boolean(message.success)}>{pending ? "Checking invitation…" : isDemo ? "Accept preview invite" : "Accept invitation"} <ArrowRight size={15}/></button>{!isDemo ? <p className="form-hint" style={{ marginTop: 14 }}>Not signed in? <Link href={loginUrl} className="text-link">Sign in to accept this invite</Link></p> : null}<p className="form-hint" style={{ marginTop: 14 }}>{isDemo ? "Frontend preview only: no server-side invitation check is connected." : "Invitation tokens are checked by the database and cannot be used after expiry or revocation."} <Link href="/app" className="text-link">Open workspace</Link></p></section></div></main>;
}
