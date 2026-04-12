import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "TradePro",
  description: "Premium resume builder for the trades",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <div suppressHydrationWarning>
          <Header />
        </div>
        {children}
      </body>
    </html>
  );
}
