import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthHeader() {
  return (
    <header className="auth-header">
      <div className="auth-header-inner">
        <Link href="/" className="brand" aria-label="Greenstamp home">
          <span className="brand-mark"><CheckCheck size={18} /></span>
          <span>greenstamp</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
