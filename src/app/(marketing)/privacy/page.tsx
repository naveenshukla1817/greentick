import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Greenstamp handles account, team, task, review and proof-file information.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy policy · Greenstamp", url: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="page-main">
      <div className="site-container">
        <article className="prose legal-document">
          <div className="eyebrow"><span className="eyebrow-mark" /> Legal</div>
          <h1>Privacy policy</h1>
          <p className="lead">Greenstamp helps teams assign work, submit evidence, review submissions and keep decisions connected to each task. This policy explains the information handled when you use the live Greenstamp web app.</p>
          <p className="last-updated">Last updated: 11 October 2026</p>

          <h2>1. Who this policy covers</h2>
          <p>This policy applies to Greenstamp’s website and workspace, including account creation and sign-in, teams, tasks, proof submissions, reviews, notifications and profile settings. The production URL is the domain shown in your browser when you access Greenstamp. The product contact published on the site is <a href="mailto:hello@greenstamp.app">hello@greenstamp.app</a>.</p>

          <h2>2. Information we handle</h2>
          <ul>
            <li><strong>Account and profile details:</strong> email address, authentication identifiers, display name and session information used to sign you in and identify your profile.</li>
            <li><strong>Workspace content:</strong> team names and membership, tasks, task descriptions, assignees, priorities, deadlines, statuses, invite records, notifications and related timestamps.</li>
            <li><strong>Proof and review content:</strong> files you submit as evidence, submission notes, review decisions, feedback and information needed to associate a file with its task and team.</li>
            <li><strong>Technical and security information:</strong> request and diagnostic information that may be recorded by the hosting and infrastructure providers to deliver, secure and troubleshoot the service.</li>
            <li><strong>Local preferences:</strong> your selected appearance theme and the privacy-notice choice are remembered in browser storage. The app may also use essential browser cookies to maintain an authenticated session.</li>
          </ul>

          <h2>3. Why we use this information</h2>
          <p>Greenstamp uses this information to create and secure accounts; provide team, task, submission and review features; display notifications; store and retrieve proof files; send authentication or password-reset messages; remember local preferences; troubleshoot errors; prevent misuse; and maintain the reliability and security of the service.</p>

          <h2>4. Team content and who can see it</h2>
          <p>Workspace content is intended to be shared with the relevant team members according to their membership and permissions. Team members may be able to see assigned tasks, task status, submissions, proof files, review notes and other content required for the workflow. Do not upload information you do not have permission to share. Keep invite links private and remove members who should no longer have workspace access.</p>

          <h2>5. Service providers and sharing</h2>
          <p>The web application is intended to be hosted on <a href="https://vercel.com/" target="_blank" rel="noreferrer">Vercel</a>, and uses <a href="https://supabase.com/" target="_blank" rel="noreferrer">Supabase</a> for authentication, database services and private file storage. Authentication email delivery is handled through the email-delivery configuration used by Supabase. These providers process information as needed to operate their services and may create technical or security logs.</p>
          <p>Greenstamp does not include a separate advertising or analytics SDK in the current application code. Information may also be disclosed when required by law, to respond to valid legal process, to protect users or the service, or as part of a business transfer where permitted by applicable law. We do not sell your workspace content.</p>

          <h2>6. Cookies and browser storage</h2>
          <p>Authentication cookies help keep a signed-in session working across page requests. Browser local storage remembers the theme you choose and your response to the privacy notice. These local preferences remain in the browser where you set them; clearing browser storage may reset them or sign you out. The current application code does not load a separate advertising-cookie or analytics system.</p>

          <h2>7. Retention and deletion</h2>
          <p>Account and workspace information is retained for as long as needed to provide the service, maintain task and review history, protect the service and meet applicable obligations. The live V1 does not publish a fixed retention timetable for every data category, and provider backups or security logs may persist for a period under the providers’ own retention schedules. To request access, correction or deletion of account information, email <a href="mailto:hello@greenstamp.app">hello@greenstamp.app</a> from the address associated with your account. Some team content may also need to be handled by the relevant team owner.</p>

          <h2>8. Security</h2>
          <p>Greenstamp uses authenticated sessions, database access policies and private storage for proof files. No online system can guarantee absolute security. Use a unique password, protect your email account, avoid sharing credentials, and do not upload passwords, payment-card details or other highly sensitive information into tasks or proof files.</p>

          <h2>9. International processing</h2>
          <p>Vercel and Supabase may process service data in the regions and locations used to operate their services. Depending on configuration and provider infrastructure, information may be processed outside your country. The providers’ privacy and security documentation describes their respective handling practices.</p>

          <h2>10. Your choices and rights</h2>
          <p>Depending on the laws that apply to you, you may have rights to access, correct, export, restrict or request deletion of personal information. You can change your display name in workspace settings, change your theme with the appearance control, and clear local browser preferences through your browser settings. For account-data requests or questions about this policy, contact <a href="mailto:hello@greenstamp.app">hello@greenstamp.app</a>.</p>

          <h2>11. Children</h2>
          <p>Greenstamp is a team-workflow product and is not designed for children to use independently. If you believe a child has provided personal information in the service, contact us so the situation can be reviewed.</p>

          <h2>12. Updates and contact</h2>
          <p>This policy may be updated when Greenstamp’s features, providers or data practices change. The “Last updated” date above will be revised when material changes are made. Questions and privacy requests can be sent to <a href="mailto:hello@greenstamp.app">hello@greenstamp.app</a>.</p>
          <div className="legal-note"><strong>Service details:</strong> this policy reflects the current Greenstamp V1 features and providers visible in the deployed application. Provider terms, infrastructure logs, exact backup-retention periods and any future payment or analytics features may be governed by additional notices as the service evolves.</div>
        </article>
      </div>
    </main>
  );
}
