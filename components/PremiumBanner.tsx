"use client";

import Link from "next/link";

export default function PremiumBanner() {
  return (
    <div className="w-full bg-neutral-900 text-neutral-100 py-3 px-4 text-center text-sm flex flex-col md:flex-row items-center justify-center gap-2 shadow">
      <span>You’re using the Standard version.</span>
      <Link
        href="/pricing"
        className="underline font-medium hover:text-white"
      >
        Unlock Premium templates + tools for $29
      </Link>
    </div>
  );
}
