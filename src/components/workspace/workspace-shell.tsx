"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck, Bell, ChevronDown, ClipboardCheck, FileUp, LayoutDashboard, ListTodo, Menu, Search, Settings2, UsersRound, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import type { WorkspaceTeam } from "@/lib/workspace-shared";

const SIDEBAR_KEY = "greenstamp_sidebar_collapsed_v1";

type Props = {
  children: React.ReactNode;
  teamName: string;
  teamId: string | null;
  teams: WorkspaceTeam[];
  userName: string;
  userEmail: string;
  currentRole: "owner" | "member";
  isDemo: boolean;
};

function displayName(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean) return "Greenstamp user";
  return clean.split(" ").map((word) => {
    if (word === word.toUpperCase() && word.length <= 4) return word;
    return word.charAt(0).toLocaleUpperCase("en-IN") + word.slice(1);
  }).join(" ");
}

export function WorkspaceShell({ children, teamName, teamId, teams, userName, userEmail, currentRole, isDemo }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeView = searchParams.get("view") || "all";
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [teamPending, setTeamPending] = useState(false);
  const [teamError, setTeamError] = useState("");
  const pendingG = useRef(false);
  const gTimer = useRef<number | null>(null);
  const niceName = displayName(userName);
  const roleLabel = currentRole === "owner" ? "Owner" : "Member";

  const navItems = useMemo(() => currentRole === "owner" ? [
    { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true, shortcut: "G D" },
    { href: "/app/tasks", label: "Tasks", icon: ListTodo, shortcut: "G T", activeWhen: () => pathname.startsWith("/app/tasks") },
    { href: "/app/reviews", label: "Review inbox", icon: ClipboardCheck, shortcut: "G R" },
    { href: "/app/team", label: "Team", icon: UsersRound, shortcut: "G M" },
    { href: "/app/settings", label: "Settings", icon: Settings2, shortcut: "G S" },
  ] : [
    { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true, shortcut: "G D" },
    { href: "/app/tasks?view=mine", label: "My tasks", icon: ListTodo, shortcut: "G T", activeWhen: () => pathname.startsWith("/app/tasks") && routeView !== "submit" },
    { href: "/app/tasks?view=submit", label: "Submit proof", icon: FileUp, shortcut: "G P", activeWhen: () => pathname.startsWith("/app/tasks") && routeView === "submit" },
  ], [currentRole, pathname, routeView]);

  useEffect(() => {
    try { setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true"); } catch { /* storage may be blocked */ }
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarReady) return;
    try { window.localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* storage may be blocked */ }
  }, [collapsed, sidebarReady]);

  useEffect(() => {
    if (!profileOpen) return;
    function closeOnOutside(event: PointerEvent) {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) setProfileOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setProfileOpen(false); }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, [profileOpen]);

  const navigateShortcut = useCallback((key: string) => {
    const targets: Record<string, string> = {
      d: "/app", t: currentRole === "owner" ? "/app/tasks" : "/app/tasks?view=mine",
      r: "/app/reviews", m: "/app/team", s: "/app/settings",
      p: "/app/tasks?view=submit",
    };
    const target = targets[key];
    if (target && (currentRole === "owner" || ["d", "t", "p"].includes(key))) router.push(target);
  }, [currentRole, router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      const key = event.key.toLowerCase();
      if (typing) return;
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault();
        router.push(currentRole === "owner" ? "/app/tasks" : "/app/tasks?view=mine");
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (pendingG.current) {
        pendingG.current = false;
        if (gTimer.current !== null) window.clearTimeout(gTimer.current);
        if (["d", "t", "r", "m", "s", "p"].includes(key)) {
          event.preventDefault();
          navigateShortcut(key);
        }
        return;
      }
      if (key === "g" && !event.ctrlKey && !event.metaKey) {
        pendingG.current = true;
        gTimer.current = window.setTimeout(() => { pendingG.current = false; }, 1100);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (gTimer.current !== null) window.clearTimeout(gTimer.current);
    };
  }, [navigateShortcut, router, currentRole]);

  async function changeTeam(nextTeamId: string) {
    if (!nextTeamId || nextTeamId === teamId || isDemo) return;
    setTeamPending(true);
    setTeamError("");
    try {
      const response = await fetch("/api/workspace/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: nextTeamId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Could not switch workspace.");
      }
      setMobileOpen(false);
      router.refresh();
    } catch (error) {
      setTeamError(error instanceof Error ? error.message : "Could not switch workspace.");
    } finally {
      setTeamPending(false);
    }
  }

  const activeLabel = pathname === "/app" ? "Dashboard" : navItems.find((item) => {
    if ("activeWhen" in item && item.activeWhen) return item.activeWhen();
    return "exact" in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
  })?.label || (pathname.startsWith("/app/notifications") ? "Notifications" : "Workspace");

  return (
    <div className="workspace-body" id="main-content">
      {mobileOpen ? <button className="sidebar-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}
      <div className={`workspace-shell${collapsed ? " is-sidebar-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}>
        <aside className="workspace-sidebar" aria-label="Workspace navigation">
          <div className="sidebar-brand-row">
            <Link href="/app" className="sidebar-brand" aria-label="Greenstamp overview" onClick={() => setMobileOpen(false)}>
              <span className="brand-mark"><BadgeCheck size={19} strokeWidth={2.4} /></span>
              <span className="brand-word">greenstamp</span>
            </Link>
            <button className="sidebar-collapse-button" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button className="sidebar-mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19}/></button>
          </div>

          <div className="team-switcher-block">
            <label className="sidebar-section-label" htmlFor="team-switcher">Workspace</label>
            {teams.length > 1 && !isDemo ? (
              <div className="team-select-wrap"><span className="team-initials"><BadgeCheck size={17}/></span><select id="team-switcher" aria-label="Switch workspace" value={teamId || ""} disabled={teamPending} onChange={(event) => void changeTeam(event.target.value)}>
                {teams.map((team) => <option key={team.id} value={team.id}>{displayName(team.name)}</option>)}
              </select><ChevronDown className="team-select-chevron" size={14}/></div>
            ) : (
              <Link className="team-switcher" href="/app/team" title={`Manage ${teamName}`} onClick={() => setMobileOpen(false)}>
                <span className="team-initials"><BadgeCheck size={17}/></span>
                <span className="team-switcher-copy">{displayName(teamName)}<small>{isDemo ? "Sample workspace" : `${teams.length || 1} workspace${teams.length === 1 ? "" : "s"}`}</small></span>
                <ChevronDown size={15} className="team-switcher-chevron" />
              </Link>
            )}
            {teamError ? <p className="team-switcher-error" role="alert">{teamError}</p> : null}
          </div>

          <nav className="workspace-nav" aria-label="Main menu">
            {navItems.map((item) => {
              const active = "activeWhen" in item && item.activeWhen
                ? item.activeWhen()
                : "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const badge =
                "badge" in item && typeof item.badge === "number"
                  ? item.badge
                  : 0;
              const attention = "attention" in item && item.attention === true;
              return (
                <Link href={item.href} key={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} title={item.label} onClick={() => setMobileOpen(false)}>
                  <Icon size={19} strokeWidth={1.9} />
                  <span className="workspace-nav-label">{item.label}</span>
                  {attention ? <span className="nav-attention-dot" aria-label="Needs attention" /> : null}
                  {badge ? <span className="nav-count" aria-label={`${badge} items`}>{badge}</span> : null}
                  <kbd className="nav-shortcut">{item.shortcut}</kbd>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-brand-promise"><span className="sidebar-privacy-mark"><BadgeCheck size={16}/></span><span><strong>Work with proof.</strong><small>Every handoff, accounted for.</small></span></div>
            <div className={`sidebar-user-menu${profileOpen ? " is-open" : ""}`} ref={profileMenuRef}>
              <button className="sidebar-user-trigger" type="button" aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => setProfileOpen((value) => !value)}>
                <Avatar name={niceName} src="/avatars/default.png" size={38} className="sidebar-user-avatar" />
                <span className="sidebar-user-copy"><strong>{niceName}</strong><small>{roleLabel}</small></span>
                <ChevronDown size={16} className="sidebar-user-chevron" />
              </button>
              {profileOpen ? <div className="profile-menu-content" role="menu">
                <span className="profile-menu-email">{userEmail || "Signed in"}</span>
                <Link role="menuitem" href="/app/settings" onClick={() => { setMobileOpen(false); setProfileOpen(false); }}>Account settings</Link>
                {isDemo ? <Link role="menuitem" href="/" onClick={() => setProfileOpen(false)}>Exit preview</Link> : <form action="/auth/signout" method="post"><button role="menuitem" type="submit">Sign out</button></form>}
              </div> : null}
            </div>
          </div>
        </aside>

        <div className="workspace-main">
          <header className="workspace-topbar">
            <div className="workspace-topbar-left">
              <button type="button" className="sidebar-mobile-open" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
              <button type="button" className="topbar-search" aria-label="Open task search (Ctrl+K)" onClick={() => router.push(currentRole === "owner" ? "/app/tasks" : "/app/tasks?view=mine")}>
                <Search size={17}/><span>Find tasks, proofs, and reviews</span><kbd>Ctrl K</kbd>
              </button>
            </div>
            <div className="topbar-right">
              {isDemo ? <span className="demo-chip">Sample data</span> : null}
              <ThemeToggle />
              <Link href="/app/notifications" className="topbar-icon topbar-notification" aria-label="Notifications">
                <Bell size={19}/>
              </Link>
              <div className="topbar-user">
                <Avatar name={niceName} src="/avatars/default.png" size={36} priority />
                <span className="topbar-user-copy"><strong>{niceName}</strong><small>{roleLabel}</small></span>
              </div>
            </div>
          </header>
          <div className="workspace-page-container">
            <div className="workspace-page-context"><span>Workspace</span><span className="context-separator" aria-hidden="true">›</span><strong>{activeLabel}</strong></div>
            <div className="workspace-content">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}