import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms for using Greenstamp teams, tasks, proof submissions and review workflows.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of service · Greenstamp", url: "/terms" },
};

export default function TermsPage() {
  return (
    <main id="main-content" className="page-main">
      <div className="site-container">
        <article className="prose legal-document">
          <div className="eyebrow"><span className="eyebrow-mark" /> Legal</div>
          <h1>Terms of service</h1>
          <p className="lead">These terms cover your use of Greenstamp, a workspace for assigning tasks, submitting evidence, reviewing work and recording decisions. By accessing or using the service, you agree to use it lawfully and follow these terms.</p>
          <p className="last-updated">Last updated: 11 October 2026</p>

          <h2>1. About the service</h2>
          <p>Greenstamp provides account and team workspaces with task assignment, deadlines and priorities, proof-file submissions, review decisions, feedback, notifications and related settings. Features may change as the product develops. The current production URL is the domain shown in your browser when you access Greenstamp.</p>

          <h2>2. Your account</h2>
          <p>You must provide an email address you control, use accurate profile information and keep your sign-in credentials secure. You are responsible for activity carried out through your account, except where caused by a security issue for which you are not responsible. Notify us promptly if you suspect unauthorized access. Do not share passwords or attempt to access another user’s account.</p>

          <h2>3. Teams, roles and invitations</h2>
          <p>Team owners and members should use membership and invitation features responsibly. Team owners are responsible for inviting appropriate people, assigning work and managing membership. Treat invitation links as private, and do not use or share a link to bypass team access controls. Your ability to view or change workspace information depends on your membership and permissions.</p>

          <h2>4. Your content and proof files</h2>
          <p>You retain the rights you hold in tasks, notes, files and other material you submit. You grant Greenstamp the limited permission needed to host, store, display, transmit and process that material to operate the service and deliver the workflow you request. You confirm that you have the rights and permissions needed to upload and share it with your team.</p>
          <p>Do not upload unlawful content, material that violates another person’s privacy or intellectual-property rights, malicious code, or files you are not authorized to share. Keep copies of important work outside Greenstamp where appropriate.</p>

          <h2>5. Acceptable use</h2>
          <p>You must not misuse the service, interfere with its operation, probe or bypass access controls, access another team’s data without permission, introduce malware, abuse invitation links, impersonate others, or use Greenstamp to violate applicable law or another person’s rights. We may investigate suspected misuse and take reasonable steps to protect the service and its users.</p>

          <h2>6. Reviews and decisions</h2>
          <p>Greenstamp records workflow status, submissions, feedback and approval decisions. A recorded approval is a team workflow decision; it does not independently certify that work is accurate, safe, compliant, legally sufficient or suitable for a particular purpose. Teams remain responsible for their own review standards and final decisions.</p>

          <h2>7. Availability and changes</h2>
          <p>We aim to keep Greenstamp useful and available, but uninterrupted access is not guaranteed. The service may be changed, paused or limited for maintenance, security, provider outages, legal reasons or product updates. Features may be added, changed or discontinued, and we will update these terms when material changes require it.</p>

          <h2>8. Fees</h2>
          <p>The current V1 website does not present a paid subscription or payment checkout. If paid plans, usage limits or other charges are introduced, the applicable pricing and terms will be shown before you are asked to purchase or pay for them.</p>

          <h2>9. Suspension and account closure</h2>
          <p>You may stop using Greenstamp at any time. If you need an account-data deletion request, contact <a href="mailto:hello@greenstamp.app">hello@greenstamp.app</a>. We may suspend or restrict access when reasonably necessary to respond to suspected abuse, protect account or team data, comply with law, address a security incident, or enforce these terms. Any retained information is handled according to the Privacy Policy and applicable obligations.</p>

          <h2>10. Intellectual property</h2>
          <p>Greenstamp’s product name, interface, branding and service code are owned by or licensed to the service operator, except for third-party components and content. These terms do not transfer ownership of the product to you. You may use the service for its intended purpose while complying with these terms.</p>

          <h2>11. Disclaimers and liability</h2>
          <p>To the extent permitted by applicable law, Greenstamp is provided on an “as available” basis and we do not promise that the service will be uninterrupted, error-free or suitable for every purpose. You should maintain appropriate backups of important content and independently verify consequential work and decisions. Nothing in these terms excludes rights or liability that cannot lawfully be excluded or limited.</p>

          <h2>12. Privacy</h2>
          <p>Use of Greenstamp is also subject to the <Link href="/privacy">Privacy Policy</Link>, which explains the account, team, task, proof-file, cookie and infrastructure information handled by the current service.</p>

          <h2>13. Changes and contact</h2>
          <p>These terms may be updated as Greenstamp changes. The date at the top shows when they were last revised. For questions about the service or these terms, contact <a href="mailto:hello@greenstamp.app">hello@greenstamp.app</a>.</p>
          <div className="legal-note">These terms describe the current V1 product and are general service terms, not jurisdiction-specific legal advice. Additional terms may apply if the service adds paid plans or other material features.</div>
        </article>
      </div>
    </main>
  );
}
