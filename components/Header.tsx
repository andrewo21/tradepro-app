"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full border-b bg-white relative z-50">
      {/* MENU — top-right on all screen sizes */}
      <div
        className="menu-ui-only absolute right-4 top-4 sm:right-10 sm:top-10 z-10"
        ref={menuRef}
      >
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-2 border rounded-md bg-neutral-100 hover:bg-neutral-200 text-sm font-medium"
          >
            Menu ▾
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-2 text-sm z-50">
              <Link href="/" className="block px-4 py-2 hover:bg-neutral-100">Home</Link>
              <Link href="/resume" className="block px-4 py-2 hover:bg-neutral-100">Resume Builder</Link>
              <Link href="/cover-letter" className="block px-4 py-2 hover:bg-neutral-100">Cover Letter Generator</Link>

              <div className="px-4 py-2 opacity-80">
                <div>Project List Builder</div>
                <div className="text-[10px] uppercase tracking-wide bg-neutral-300 px-1.5 py-0.5 rounded inline-block mt-1">
                  Coming Soon
                </div>
              </div>

              <Link href="/pricing" className="block px-4 py-2 hover:bg-neutral-100">Pricing</Link>
              <Link href="/about" className="block px-4 py-2 hover:bg-neutral-100">About Us</Link>
              <Link href="/contact" className="block px-4 py-2 hover:bg-neutral-100">Contact Us</Link>
            </div>
          )}
        </div>
      </div>

      {/* BRANDING + TAGLINE — centered, stacked vertically */}
      <div className="flex flex-col items-center justify-center px-4 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <img
          src="/brand/Tradepro-logo.svg"
          alt="TradePro Technologies"
          className="w-[260px] sm:w-[420px] md:w-[560px] lg:w-[700px] h-auto"
          style={{ display: "block" }}
        />

        <p
          className="text-center font-semibold text-neutral-600 mt-4 leading-snug
                     text-base sm:text-2xl md:text-3xl lg:text-4xl
                     max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
        >
          Built for the trades. Engineered to get you hired.
        </p>
      </div>
    </header>
  );
}
