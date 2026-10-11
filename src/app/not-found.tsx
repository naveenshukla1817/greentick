import Link from "next/link";
import { ArrowLeft, CheckCheck } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function NotFound() {
  return <><MarketingNav/><main id="main-content" className="page-main"><div className="site-container"><div className="prose"><div className="eyebrow"><span className="eyebrow-mark"/> 404 / Page not found</div><h1>That page isn't here.</h1><p className="lead">The link may be old, or the page may have moved. Head back to the workspace and keep things moving.</p><Link href="/" className="button button-primary"><ArrowLeft size={15}/> Back to Greenstamp</Link></div><div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 12 }}><CheckCheck size={16} color="#1b5e3b"/> Greenstamp · Clear work, clear decisions.</div></div></main><MarketingFooter/></>;
}
