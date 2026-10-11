"use client";

import { useState } from "react";
import { CheckCheck, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ActionState = { error?: string; success?: string };
const NAME_KEY = "greenstamp_demo_display_name";

export function SettingsView({ displayName, email, userId, isDemo }: { displayName: string; email: string; userId: string; isDemo: boolean }) {
  const [name, setName] = useState(displayName);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<ActionState>({});
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage({});
    if (name.trim().length < 2 || name.trim().length > 100) { setMessage({ error: "Enter a name between 2 and 100 characters." }); setPending(false); return; }
    try {
      if (isDemo) {
        window.localStorage.setItem(NAME_KEY, name.trim());
        setMessage({ success: "Preview preference saved in this browser." });
      } else {
        const supabase = createClient();
        const { error } = await supabase.from("profiles").update({ display_name: name.trim(), updated_at: new Date().toISOString() }).eq("id", userId);
        if (error) throw error;
        setMessage({ success: "Profile updated. Teammates will see your new display name." });
      }
    } catch (error) { setMessage({ error: error instanceof Error ? error.message : "Could not save the profile." }); }
    finally { setPending(false); }
  }
  return <>
    <div className="page-title-row"><div><h1>Settings</h1><p>Manage your profile and workspace preferences.</p></div></div>
    <section className="content-panel" style={{ padding: 24 }}><div className="panel-heading" style={{ paddingTop: 0 }}><div><h2>Your profile</h2><p>The name teammates see beside tasks and submissions.</p></div></div><form className="inline-form" style={{ paddingTop: 5 }} onSubmit={save}><div className="form-field"><label htmlFor="display-name">Display name</label><input id="display-name" minLength={2} maxLength={100} required value={name} onChange={(e) => setName(e.target.value)}/></div><div className="form-field"><label htmlFor="email-address">Email address</label><input id="email-address" value={email} readOnly/><span className="form-hint">Email changes are managed through account security settings.</span></div>{message.error ? <p className="form-error" role="alert">{message.error}</p> : null}{message.success ? <p className="form-success" role="status">{message.success}</p> : null}<button className="button button-primary" disabled={pending} type="submit"><Save size={15}/>{pending ? "Saving…" : "Save profile"}</button></form></section>
    <section className="content-panel" style={{ padding: 24, marginTop: 24 }}><div className="panel-heading" style={{ paddingTop: 0 }}><div><h2>Privacy and sessions</h2><p>Know where the workspace stores your choices.</p></div><CheckCheck size={18} color="#1b5e3b"/></div><p style={{ color: "var(--muted)", fontSize: 13, maxWidth: 700 }}>{isDemo ? "This build is running in preview mode. Demo changes stay in this browser and do not affect any team." : "Profile and task data are stored in your Greenstamp Supabase project. Team access is controlled by database policies; proof files live in private Storage."} Review the <a href="/privacy" className="text-link">privacy policy</a> and <a href="/terms" className="text-link">terms of service</a> for details.</p>{isDemo ? <p className="form-hint">You are in preview mode; profile changes stay in this browser only.</p> : null}</section>
  </>;
}
