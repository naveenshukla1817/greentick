import type { Metadata } from "next";
import { AuthHeader } from "@/components/layout/auth-header";
import { AuthForm } from "@/components/layout/auth-forms";

export const metadata: Metadata = { title: "Create an account", alternates: { canonical: "/signup" }, robots: { index: false, follow: false } };
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") && !params.next.startsWith("//") && !params.next.includes("\\") ? params.next : "/app";
  return <><AuthHeader/><AuthForm mode="signup" next={next}/></>;
}
