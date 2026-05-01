import type { Metadata } from "next";
import "./(us)/globals.css";
import UserIdProvider from "@/components/UserIdProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "TradePro — Resume Builder for the Trades (No Subscription)",
    template: "%s | TradePro",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TradePro",
  },
  formatDetection: {
    telephone: false,
  },
  description:
    "TradePro is a resume builder made for tradespeople, students, and real‑world workers. One‑time purchase, no subscription, simple tools to turn real work experience into a clean, professional resume.",
  metadataBase: new URL("https://tradeprotech.ai"),
  openGraph: {
    type: "website",
    siteName: "TradePro Technologies",
    title: "TradePro — Resume Builder for the Trades",
    description:
      "TradePro is a resume builder made for tradespeople, students, and real‑world workers. One‑time purchase, no subscription, simple tools to turn real work experience into a clean, professional resume.",
    url: "https://tradeprotech.ai/",
    images: [
      {
        url: "/brand/Tradepro-logo.svg",
        width: 1200,
        height: 630,
        alt: "TradePro Technologies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradePro — Resume Builder for the Trades",
    description:
      "One‑time purchase resume builder for tradespeople, students, and real‑world workers. No subscription.",
    images: ["/brand/Tradepro-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TradePro Technologies",
  url: "https://tradeprotech.ai/",
  logo: "https://tradeprotech.ai/brand/Tradepro-logo.svg",
  contactPoint: {
    "@type": "ContactPoint",
    email: "andrew@tradeprotech.ai",
    contactType: "customer support",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TradePro" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="manifest" href="/manifest.json" />
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="bg-neutral-50 text-neutral-900">
        <UserIdProvider />
        {children}
      </body>
    </html>
  );
}
