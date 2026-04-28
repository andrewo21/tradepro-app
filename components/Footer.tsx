"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-700">
      <div className="flex flex-col items-center justify-center py-8 px-4 gap-4">
        <img
          src="/brand/Tradepro-logo.svg"
          alt="TradePro Technologies"
          className="inline-block w-[220px] sm:w-[300px] md:w-[360px] h-auto"
          style={{ transform: "translateX(-12%)" }}
        />

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-neutral-500">
          <Link href="/legal/terms" className="hover:text-neutral-300 transition">Terms of Service</Link>
          <Link href="/legal/privacy" className="hover:text-neutral-300 transition">Privacy Policy</Link>
          <Link href="/legal/refunds" className="hover:text-neutral-300 transition">Refund Policy</Link>
          <Link href="/contact" className="hover:text-neutral-300 transition">Contact Us</Link>
        </div>

        <span className="text-neutral-600 text-center">
          © {new Date().getFullYear()} TradePro Technologies. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
