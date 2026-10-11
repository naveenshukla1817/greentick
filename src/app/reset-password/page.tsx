import type { Metadata } from "next";
import { AuthHeader } from "@/components/layout/auth-header";
import { ResetPasswordForm } from "@/components/layout/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password", alternates: { canonical: "/reset-password" }, robots: { index: false, follow: false } };
export default function ResetPasswordPage() { return <><AuthHeader/><ResetPasswordForm/></>; }
