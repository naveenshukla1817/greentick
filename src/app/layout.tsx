import type { Metadata, Viewport } from "next";
import { CookieConsent } from "@/components/layout/cookie-consent";
import "./globals.css";

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Greenstamp — Work, reviewed and approved",
    template: "%s · Greenstamp",
  },
  openGraph: {
    type: "website",
    siteName: "Greenstamp",
    title: "Greenstamp — Work, reviewed and approved",
    url: siteUrl,
    images: [{ url: "/og-card.svg", width: 1200, height: 630, alt: "Greenstamp work review workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greenstamp — Work, reviewed and approved",
    images: ["/og-card.svg"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6faf6" },
    { media: "(prefers-color-scheme: dark)", color: "#09120c" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alata&family=Abril+Fatface&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('greenstamp_theme_v1');if(t!=='dark'&&t!=='light')t='light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='light';}})();" }} />
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
