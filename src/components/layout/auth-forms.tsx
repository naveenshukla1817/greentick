"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AuthMode = "login" | "signup" | "reset";
type Message = { kind: "error" | "success"; text: string } | null;

export function AuthForm({ mode, next = "/app", initialError = "" }: { mode: AuthMode; next?: string; initialError?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(initialError ? { kind: "error", text: initialError } : null);
  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const displayName = String(form.get("displayName") || "").trim();

    if (!isSupabaseConfigured()) {
      setMessage({ kind: "error", text: "Supabase is not configured yet. Add the project URL and publishable key to .env.local, then restart the dev server." });
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      if (isSignup) {
        const callback = new URL("/auth/callback", window.location.origin);
        callback.searchParams.set("next", next);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName }, emailRedirectTo: callback.toString() },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setMessage({ kind: "success", text: "Account request received. Check your inbox for the confirmation email to finish creating your account." });
        }
      } else if (isReset) {
        const callback = new URL("/auth/callback", window.location.origin);
        callback.searchParams.set("next", "/reset-password");
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback.toString() });
        if (error) throw error;
        setMessage({ kind: "success", text: "If an account matches that email, a password-reset link has been sent. Check your inbox." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      }
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <main id="main-content" className="auth-wrap">
      <aside className="auth-aside">
        <div>
          <span className="eyebrow"><span className="eyebrow-mark"/> The work, without the guesswork</span>
          <h1>{isSignup ? "Give every task a clear next step." : isReset ? "Get back to your workspace." : "Your team's work, ready for review."}</h1>
          <p>{isSignup ? "Create a workspace, invite your team, and make approvals part of the workflow." : isReset ? "Recover access to your account securely." : "See assignments, submit evidence, and keep review decisions tied to the work."}</p>
          <ul className="check-list">
            <li><Check size={17}/> Clear task ownership</li>
            <li><Check size={17}/> Proof and feedback in context</li>
            <li><Check size={17}/> Approval history that stays visible</li>
          </ul>
        </div>
        <div className="auth-aside-footer" style={{ display: "flex", gap: 9, alignItems: "center", color: "#657166", fontSize: 12 }}><ShieldCheck size={16}/> Your team data is protected by database access policies.</div>
      </aside>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <h2>{isSignup ? "Create your account" : isReset ? "Reset your password" : "Welcome back"}</h2>
          <p>{isSignup ? "Start a workspace and invite your team." : isReset ? "Enter your account email to receive a secure reset link." : "Sign in to continue to your workspace."}</p>
          <form className="modal-form" onSubmit={handleSubmit}>
            {!isReset && <input type="hidden" name="next" value={next} />}
            {isSignup ? <div className="form-field"><label htmlFor="displayName">Your name</label><input id="displayName" name="displayName" autoComplete="name" minLength={2} maxLength={80} required placeholder="e.g. Alex Morgan" /></div> : null}
            <div className="form-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></div>
            {!isReset ? <div className="form-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : 1} maxLength={128} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} />{!isSignup ? <div style={{ textAlign: "right" }}><Link className="text-link" style={{ fontSize: 11 }} href="/forgot-password">Forgot password?</Link></div> : null}</div> : null}
            {message ? <p className={message.kind === "error" ? "form-error" : "form-success"} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
            <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Please wait…" : isSignup ? "Create account" : isReset ? "Send reset link" : "Sign in"} <ArrowRight size={15}/></button>
          </form>
          <div className="auth-footer">{isSignup ? <>Already have an account? <Link href="/login">Sign in</Link></> : isReset ? <>Remembered it? <Link href="/login">Back to sign in</Link></> : <>New to Greenstamp? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>}</div>
          <div className="auth-footer" style={{ marginTop: 14 }}><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></div>
        </div>
      </section>
    </main>
  );
}
