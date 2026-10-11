import type { Metadata } from "next";
import { AuthHeader } from "@/components/layout/auth-header";
import { AuthForm } from "@/components/layout/auth-forms";

export const metadata: Metadata = { title: "Reset password", alternates: { canonical: "/forgot-password" }, robots: { index: false, follow: false } };
export default function ForgotPasswordPage() { return <><AuthHeader/><AuthForm mode="reset"/></>; }
