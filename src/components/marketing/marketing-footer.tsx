import Link from "next/link";
import { CheckCheck } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <Link href="/" className="footer-brand" aria-label="Greenstamp home">
          <span className="brand-mark" aria-hidden="true"><CheckCheck size={16} /></span>
          <span>greenstamp</span>
        </Link>
        <span className="footer-note">Clear work. Clear ownership. Clear sign-off.</span>
        <nav className="footer-links" aria-label="Legal and help">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/#faq">FAQ</Link>
          <a href="mailto:hello@greenstamp.app">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
