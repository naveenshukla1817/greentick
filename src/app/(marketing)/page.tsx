import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, CheckCheck, Clock3, FileCheck2, MessageSquareText, ShieldCheck, Users2 } from "lucide-react";

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="hero">
        <div className="site-container hero-grid">
          <div>
            <div className="eyebrow"><span className="eyebrow-mark" /> A clearer way to get work signed off</div>
            <h1>Work gets done.<br /><span>Proof gets seen.</span></h1>
            <p className="hero-copy">Assign the work, collect the evidence, and close the loop with a clear approval. Greenstamp keeps small teams aligned from first task to final sign-off.</p>
            <div className="hero-actions">
              <Link href="/signup" className="button button-primary">Start with your team <ArrowUpRight size={16} /></Link>
              <Link href="/app" className="button button-secondary">Explore the workspace <ArrowRight size={15} /></Link>
            </div>
            <div className="hero-footnote">Built for teams that need visible progress and clear ownership.</div>
          </div>
          <div className="preview-window" aria-label="Preview of the Greenstamp review workspace">
            <div className="preview-top">
              <div className="preview-appname"><span className="mini-brand-mark"><CheckCheck size={13} /></span> Greenstamp <span style={{ color: "#89958a", fontWeight: 400 }}> / Studio North</span></div>
              <span className="preview-meta">TASK REVIEW</span>
            </div>
            <div className="preview-content">
              <div className="preview-heading">
                <div><h2>Review inbox</h2><p>Work that needs your sign-off</p></div>
                <span className="approval-count">3 to review</span>
              </div>
              <div className="preview-task">
                <div className="preview-file" aria-hidden="true"><FileCheck2 size={17}/></div>
                <div><strong>Homepage direction — v2</strong><small>Priya Shah · Submitted 12 min ago</small></div>
                <span className="status-pill">In review</span>
              </div>
              <div className="preview-task">
                <div className="preview-file" aria-hidden="true"><FileCheck2 size={17}/></div>
                <div><strong>Product demo cut</strong><small>Arjun Rao · Submitted 46 min ago</small></div>
                <span className="status-pill">In review</span>
              </div>
              <div className="preview-task">
                <div className="preview-file" aria-hidden="true"><FileCheck2 size={17}/></div>
                <div><strong>Campaign assets</strong><small>Meera Iyer · Updated yesterday</small></div>
                <span className="status-pill status-changes">Revised</span>
              </div>
            </div>
            <div className="preview-bottom">
              <div className="preview-avatars" aria-label="Team members"><span className="avatar-dot">PS</span><span className="avatar-dot">AR</span><span className="avatar-dot">MI</span><span className="avatar-dot">+2</span></div>
              <span>Every task has an owner and a next step.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="Greenstamp principles">
        <div className="site-container trust-inner">
          <div className="trust-label">A small workflow built around a simple promise.</div>
          <div className="trust-points">
            <span className="trust-point"><Check size={16}/> Clear ownership</span>
            <span className="trust-point"><Check size={16}/> Real evidence</span>
            <span className="trust-point"><Check size={16}/> Explicit approval</span>
          </div>
        </div>
      </section>

      <section className="section" id="workflow">
        <div className="site-container">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-mark"/> The workflow</div><h2>From “I’m on it” to “approved”.</h2></div>
            <p>Keep the task, the deliverable, and the decision connected. No guessing whether something is finished or still waiting on feedback.</p>
          </div>
          <div className="workflow-list">
            <article className="workflow-item"><span className="workflow-number">01 / ASSIGN</span><div className="workflow-icon"><Users2 size={22}/></div><h3>Give work an owner</h3><p>Set the outcome, choose a teammate, and make the deadline visible to everyone involved.</p></article>
            <article className="workflow-item"><span className="workflow-number">02 / DO</span><div className="workflow-icon"><Clock3 size={22}/></div><h3>Make progress visible</h3><p>Members move work forward and always know what needs attention next.</p></article>
            <article className="workflow-item"><span className="workflow-number">03 / PROVE</span><div className="workflow-icon"><FileCheck2 size={22}/></div><h3>Attach the evidence</h3><p>Submit a screenshot, file, or deliverable link with a note for the reviewer.</p></article>
            <article className="workflow-item"><span className="workflow-number">04 / REVIEW</span><div className="workflow-icon"><ShieldCheck size={22}/></div><h3>Close the loop</h3><p>Approve the submission or request changes with feedback attached to that version.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="teams">
        <div className="site-container split-section">
          <div className="split-copy">
            <div className="eyebrow"><span className="eyebrow-mark"/> Made for small teams</div>
            <h2>Everyone knows what “done” means.</h2>
            <p>Greenstamp gives team leads one place to assign work and review submissions, while members get a simple path to deliver and respond to feedback.</p>
            <ul className="check-list">
              <li><Check size={17}/> One owner for every assigned task</li>
              <li><Check size={17}/> Clear status, priority, and deadline</li>
              <li><Check size={17}/> Revision history stays with the task</li>
              <li><Check size={17}/> A record of approvals and decisions</li>
            </ul>
            <div style={{ marginTop: 30 }}><Link href="/signup" className="button button-primary">Set up your workspace <ArrowUpRight size={16}/></Link></div>
          </div>
          <div className="review-ledger" aria-label="Example review history">
            <div className="panel-heading"><div><h2>Recent decisions</h2><p>A useful record, without another status meeting.</p></div><span className="preview-meta">THIS WEEK</span></div>
            <div className="ledger-row"><div className="ledger-icon"><CheckCheck size={17}/></div><div><strong>Landing page design</strong><p>Approved by Naveen · Revision 3</p></div><div className="ledger-right"><span className="status-pill status-approved">Approved</span><small>Today, 10:24</small></div></div>
            <div className="ledger-row"><div className="ledger-icon"><MessageSquareText size={17}/></div><div><strong>Onboarding video</strong><p>Feedback added to the latest submission</p></div><div className="ledger-right"><span className="status-pill status-changes">Changes requested</span><small>Yesterday</small></div></div>
            <div className="ledger-row"><div className="ledger-icon"><FileCheck2 size={17}/></div><div><strong>Campaign handoff</strong><p>Evidence submitted by Priya</p></div><div className="ledger-right"><span className="status-pill">Awaiting review</span><small>Yesterday</small></div></div>
            <div className="ledger-row"><div className="ledger-icon"><ArrowDownRight size={17}/></div><div><strong>Customer interview notes</strong><p>Assigned to Arjun · Due Friday</p></div><div className="ledger-right"><span className="status-pill">In progress</span><small>Oct 07</small></div></div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="site-container faq-grid">
          <div><div className="eyebrow"><span className="eyebrow-mark"/> Good to know</div><h2>Questions, answered.</h2><p>Start with the essentials. Greenstamp is designed to keep teams moving without turning every task into a process.</p></div>
          <div className="faq-list">
            <details className="faq-item"><summary>What is Greenstamp for?</summary><p>Greenstamp helps teams assign work, submit evidence of completion, and approve or request changes to deliverables. It is designed for small teams that need clearer accountability.</p></details>
            <details className="faq-item"><summary>Who can create and review tasks?</summary><p>A team owner creates tasks, manages members, and reviews submissions. Members see work assigned to them, submit evidence, and respond to review feedback.</p></details>
            <details className="faq-item"><summary>What counts as proof?</summary><p>In the current interface, members can attach JPG, PNG, WebP or PDF proof files (up to five files, 5 MB each) and add an optional note for the reviewer.</p></details>
            <details className="faq-item"><summary>Can a member resubmit after feedback?</summary><p>Yes. When an owner requests changes, a member can submit revised proof and add a note for the reviewer. The owner can then approve the work or request another revision.</p></details>
            <details className="faq-item"><summary>Does Greenstamp make team files public?</summary><p>Proof files are stored in a private Supabase Storage bucket. Access is tied to the team and task workflow, and downloads use short-lived signed URLs rather than permanent public file links.</p></details>
            <details className="faq-item"><summary>Is Greenstamp live?</summary><p>Greenstamp V1 is live with account sign-in, Supabase-backed profiles and team workflows, tasks, proof submissions, reviews, notifications, and private proof storage. It is an early release, so some workflows—such as automatically emailing team invitations and self-service account deletion or export—are not yet automated.</p></details>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="site-container final-cta-inner"><div><h2>Bring clarity to the work your team already does.</h2><p>Give every task an owner, every submission a review, and every approval a clear record.</p></div><Link href="/signup" className="button button-primary">Get started <ArrowUpRight size={16}/></Link></div>
      </section>
    </main>
  );
}
