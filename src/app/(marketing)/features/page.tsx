import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCheck, ClipboardCheck, FileCheck2, MessageSquareText, ShieldCheck, Users2 } from "lucide-react";

export const metadata: Metadata = { title: "Features", alternates: { canonical: "/features" } };

export default function FeaturesPage() {
  return <main id="main-content">
    <section className="section" style={{ paddingTop: 72, paddingBottom: 66 }}>
      <div className="site-container split-section">
        <div className="split-copy">
          <div className="eyebrow"><span className="eyebrow-mark"/> The details that keep work moving</div>
          <h1 style={{ fontSize: "clamp(42px,5.1vw,67px)", letterSpacing: "-3px", lineHeight: 1.04, margin: "20px 0" }}>Less chasing.<br/><span style={{ color: "var(--green)" }}>More closing loops.</span></h1>
          <p>Greenstamp connects the steps between assigning a task and knowing it is genuinely finished — with proof and a clear review decision in the same place.</p>
          <div className="hero-actions"><Link href="/app" className="button button-primary">Open workspace <ArrowUpRight size={16}/></Link><Link href="/#workflow" className="button button-secondary">See the workflow</Link></div>
        </div>
        <div className="review-ledger" aria-label="Example review inbox">
          <div className="panel-heading"><div><h2>Submission review</h2><p>Homepage direction — v2</p></div><span className="status-pill">For review</span></div>
          <div className="ledger-row"><div className="ledger-icon"><Users2 size={17}/></div><div><strong>One named owner</strong><p>Priya Shah · Due Oct 16</p></div><div className="ledger-right"><span className="status-pill">Assigned</span></div></div>
          <div className="ledger-row"><div className="ledger-icon"><FileCheck2 size={17}/></div><div><strong>Evidence attached</strong><p>Design export and reviewer note</p></div><div className="ledger-right"><span className="status-pill status-approved">Submitted</span></div></div>
          <div className="ledger-row"><div className="ledger-icon"><MessageSquareText size={17}/></div><div><strong>Explicit decision</strong><p>Approve or request a revision</p></div><div className="ledger-right"><span className="status-pill status-changes">Review</span></div></div>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="site-container">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-mark"/> The workflow, connected</div><h2>Every task has a next step.</h2></div><p>Make the handoff visible to the person doing the work and the person reviewing it. No guessing whether “done” means submitted or approved.</p></div>
        <div className="workflow-list">
          <article className="workflow-item"><span className="workflow-number">01 / TASKS</span><div className="workflow-icon"><CalendarDays size={22}/></div><h3>Define the ask</h3><p>Assign a teammate, describe the expected outcome, set priority and show the deadline.</p></article>
          <article className="workflow-item"><span className="workflow-number">02 / PROOF</span><div className="workflow-icon"><FileCheck2 size={22}/></div><h3>Keep evidence close</h3><p>Submissions belong to the task they complete, with a note that tells reviewers where to look.</p></article>
          <article className="workflow-item"><span className="workflow-number">03 / REVIEW</span><div className="workflow-icon"><ClipboardCheck size={22}/></div><h3>Make a decision</h3><p>Approve the work or request changes with a concrete note about what needs to happen next.</p></article>
          <article className="workflow-item"><span className="workflow-number">04 / RECORD</span><div className="workflow-icon"><ShieldCheck size={22}/></div><h3>Close the loop</h3><p>Keep status and approval decisions visible instead of buried in chat threads.</p></article>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="site-container split-section">
        <div className="split-copy"><div className="eyebrow"><span className="eyebrow-mark"/> A lighter way to collaborate</div><h2>Enough structure to move. Not another process to manage.</h2><p>Greenstamp is designed for small teams that need clear ownership and explicit sign-off without a heavyweight project-management setup.</p><ul className="check-list"><li><CheckCheck size={17}/> One owner per task</li><li><CheckCheck size={17}/> Priority and deadline at a glance</li><li><CheckCheck size={17}/> Revision requests with context</li><li><CheckCheck size={17}/> A shared view of what is awaiting review</li></ul></div>
        <div className="review-ledger"><div className="panel-heading"><div><h2>From assignment to approved</h2><p>Sample task status progression</p></div></div><div className="ledger-row"><div className="ledger-icon"><CalendarDays size={17}/></div><div><strong>Assigned</strong><p>Owner and deadline are clear.</p></div><div className="ledger-right"><span className="status-pill">01</span></div></div><div className="ledger-row"><div className="ledger-icon"><FileCheck2 size={17}/></div><div><strong>Submitted</strong><p>Proof is ready for review.</p></div><div className="ledger-right"><span className="status-pill">02</span></div></div><div className="ledger-row"><div className="ledger-icon"><MessageSquareText size={17}/></div><div><strong>Changes requested</strong><p>Feedback explains the next step.</p></div><div className="ledger-right"><span className="status-pill status-changes">03</span></div></div><div className="ledger-row"><div className="ledger-icon"><CheckCheck size={17}/></div><div><strong>Approved</strong><p>Completion is explicit.</p></div><div className="ledger-right"><span className="status-pill status-approved">04</span></div></div></div>
      </div>
    </section>
    <section className="final-cta"><div className="site-container final-cta-inner"><div><h2>Bring work and review into one place.</h2><p>Create a workspace, invite your team, assign work, submit proof, and keep review decisions connected to each task.</p></div><Link href="/app" className="button button-primary">Open workspace <ArrowUpRight size={16}/></Link></div></section>
  </main>;
}
