# Greenstamp — Next.js + Supabase

Greenstamp is a team workspace for assigning tasks, submitting proof, reviewing work, recording decisions, and managing team activity. This is the standalone native **Next.js App Router** base, prepared for a fresh GitHub repository and Vercel deployment. Cloudflare/Vinext is not required.

## Features included

- Email/password signup, login, email confirmation callback, and password reset
- Protected workspace routes with Supabase server-side auth cookies
- Teams, invitations, tasks, task priorities/statuses, proof-file submissions, review decisions, and notifications
- Supabase private storage with signed links for proof files
- Marketing site, Features, Privacy Policy, Terms of Service, and not-found page
- Greenstamp green/lime palette with coral, soft pink, and cyan accents
- Alata UI typography and Abril Fatface display headings
- Persistent light/dark mode toggle
- Responsive workspace navigation and dashboard

## 1. Run locally

Requirements: Node.js 20.9 or newer and npm.

```powershell
Copy-Item .env.example .env.local
# Open .env.local and add your Supabase publishable key
npm install
npm run dev
```

Open `http://localhost:3000`. To validate the production build, run `npm run build`.

## 2. Supabase environment variables

Set these in `.env.local` for local development and in Vercel Project Settings → Environment Variables for deployment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use the URL and **publishable** key from Supabase Project Settings → API Keys. Do not place a service-role/secret key in any `NEXT_PUBLIC_` variable, commit it, or put it into this ZIP.

In Supabase Authentication → URL Configuration, allow `http://localhost:3000/auth/callback` for local development and add your Vercel production domain plus its `/auth/callback` path after Vercel assigns the domain.

## 3. Deploy to Vercel

1. Create a new GitHub repository and upload/push the contents of this folder.
2. In Vercel, choose **Add New → Project**, import that repository, and keep Framework Preset **Next.js** and Root Directory `./`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` under Project Settings → Environment Variables. Set Production (and Preview if needed). Set `NEXT_PUBLIC_SITE_URL` to the production URL once known, or leave it unset so the app can use Vercel's injected deployment URL.
4. Deploy, then add the actual production URL and `/auth/callback` to Supabase Auth redirect allow-list.
5. Test signup/email confirmation, login/session refresh, task creation, proof submission, review, team invitation, and theme persistence.

## Database note

The source includes the additive migration under `supabase/migrations/`. A new GitHub repo or Vercel deployment does not apply database migrations automatically. The Supabase project must already have the Greenstamp V1 schema, RLS policies, RPC functions, and `greenstamp-proofs` storage bucket configured. Review any pending migrations and Supabase Security Advisor items before accepting real customer data.

## Legal and launch checklist

The Privacy Policy and Terms describe the current V1 features and intended providers. Confirm the contact mailbox is monitored, update legal entity/contact details as needed, configure data deletion requests, review provider regions and retention practices, and obtain appropriate legal review before commercial launch.
