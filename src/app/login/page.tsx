import type { Metadata } from "next";
import { AuthHeader } from "@/components/layout/auth-header";
import { AuthForm } from "@/components/layout/auth-forms";

export const metadata: Metadata = { title: "Log in", alternates: { canonical: "/login" }, robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) { const params = await searchParams; const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") && !params.next.includes("\\") ? params.next : "/app"; const initialError = params.error === "not_configured" ? "Supabase is not configured. Add your project URL and publishable key to .env.local." : params.error === "auth_callback_failed" ? "The sign-in or confirmation link could not be verified. Request a new link and try again." : ""; return <><AuthHeader/><AuthForm mode="login" next={next} initialError={initialError}/></>; }
