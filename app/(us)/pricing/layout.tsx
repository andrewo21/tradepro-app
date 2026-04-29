import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "TradePro Pricing — One‑Time Purchase, No Subscription",
  description:
    "Choose a one‑time purchase plan for TradePro. No subscriptions, no hidden fees. Perfect for trades workers, students, and anyone who wants a professional resume without the stress.",
  openGraph: {
    title: "TradePro Pricing — One‑Time Purchase, No Subscription",
    description:
      "Choose a one‑time purchase plan for TradePro. No subscriptions, no hidden fees.",
    url: "https://tradeprotech.ai/pricing",
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
