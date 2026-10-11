import Link from "next/link";
import { ArrowUpRight, CheckCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function MarketingNav() {
  return (
    <header className="marketing-nav">
      <div className="site-container nav-inner">
        <Link href="/" className="brand" aria-label="Greenstamp home">
          <span className="brand-mark" aria-hidden="true"><CheckCheck size={18} strokeWidth={2.4} /></span>
          <span>greenstamp</span>
        </Link>
        <nav aria-label="Main navigation" className="nav-links">
          <Link href="/#workflow">How it works</Link>
          <Link href="/features">Features</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/login" className="text-link">Log in</Link>
          <Link href="/signup" className="button button-primary button-small">Get started <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </header>
  );
}
