"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function ResetPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ error?: string; success?: string }>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice({});
    if (!isSupabaseConfigured()) {
      setNotice({ error: "Supabase is not configured. Add .env.local settings and restart the app." });
      setPending(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setNotice({ success: "Password updated. Redirecting you to sign in…" });
      await supabase.auth.signOut();
      window.setTimeout(() => router.replace("/login"), 900);
    } catch (error) {
      setNotice({ error: error instanceof Error ? error.message : "Could not update the password. Request a new reset link and try again." });
    } finally {
      setPending(false);
    }
  }
  return <main id="main-content" className="auth-wrap"><aside className="auth-aside"><div><span className="eyebrow"><span className="eyebrow-mark"/> Account security</span><h1>Choose a password you can trust.</h1><p>Use a unique password to protect your account and the team work you can access.</p></div></aside><section className="auth-panel"><div className="auth-form-wrap"><h2>Set a new password</h2><p>Choose a new password for your Greenstamp account.</p><form className="modal-form" onSubmit={submit}><div className="form-field"><label htmlFor="password">New password</label><input id="password" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></div>{notice.error ? <p className="form-error" role="alert">{notice.error}</p> : null}{notice.success ? <p className="form-success" role="status">{notice.success}</p> : null}<button className="button button-primary" type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"} <ArrowRight size={15}/></button></form><div className="auth-footer"><Link href="/login"><CheckCheck size={13} style={{ display: "inline", verticalAlign: "-2px" }}/> Back to sign in</Link></div></div></section></main>;
}
