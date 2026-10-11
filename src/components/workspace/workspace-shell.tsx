"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CheckCheck, ClipboardCheck, LayoutDashboard, ListTodo, Search, Settings2, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/tasks", label: "Tasks", icon: ListTodo },
  { href: "/app/reviews", label: "Review inbox", icon: ClipboardCheck },
  { href: "/app/team", label: "Team", icon: UsersRound },
  { href: "/app/settings", label: "Settings", icon: Settings2 },
];

export function WorkspaceShell({ children, teamName, userName, isDemo }: { children: React.ReactNode; teamName: string; userName: string; isDemo: boolean }) {
  const pathname = usePathname();
  const initials = userName.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "GS";
  const teamInitials = teamName.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "GS";
  const currentPage = navItems.find((item) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"))?.label
    || (pathname.startsWith("/app/notifications") ? "Notifications" : "Overview");

  return (
    <div className="workspace-body" id="main-content">
      <div className="workspace-shell">
        <aside className="workspace-sidebar" aria-label="Workspace navigation">
          <Link href="/app" className="sidebar-brand">
            <span className="brand-mark"><CheckCheck size={17}/></span>
            <span className="brand-word">greenstamp</span>
          </Link>
          <div className="workspace-label">Workspace</div>
          <nav className="workspace-nav">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return <Link href={item.href} key={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.8}/><span>{item.label}</span></Link>;
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="workspace-label" style={{ marginTop: 0 }}>Current team</div>
            <div className="team-switcher" aria-label={`Current team: ${teamName}`}>
              <span className="team-initials">{teamInitials}</span>
              <span className="team-switcher-copy">{teamName}<small>{isDemo ? "Sample workspace" : "Team workspace"}</small></span>
            </div>
            <div className="sidebar-privacy-note"><span className="sidebar-privacy-mark"><CheckCheck size={14}/></span><span><strong>Work with proof.</strong><small>Keep every handoff clear.</small></span></div>
          </div>
        </aside>
        <div className="workspace-main">
          <header className="workspace-topbar">
            <div className="workspace-topbar-left">
              <Link href="/app/tasks" className="topbar-search" aria-label="Browse tasks and proof submissions">
                <Search size={16}/><span>Find tasks, proofs, and reviews</span><kbd>↵</kbd>
              </Link>
            </div>
            <div className="topbar-right">
              {isDemo ? <span className="demo-chip">Sample data</span> : null}
              <ThemeToggle />
              <Link href="/app/notifications" className="topbar-icon topbar-notification" aria-label="Notifications"><Bell size={17}/><span className="notification-indicator" /></Link>
              <div className="topbar-user">
                <span className="user-avatar" title={userName}>{initials}</span>
                <span className="topbar-user-copy"><strong>{userName}</strong><small>{currentPage}</small></span>
              </div>
              {isDemo ? <Link href="/" className="button button-secondary button-small">Exit preview</Link> : <form action="/auth/signout" method="post"><button className="button button-secondary button-small" type="submit">Sign out</button></form>}
            </div>
          </header>
          <div className="workspace-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
