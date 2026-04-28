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

      {/* MENU — absolutely positioned so it never affects the centering of the logo */}
      <div
        className="absolute right-4 top-4 sm:right-8 sm:top-8 z-20"
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
              <Link href="/" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900">Home</Link>
              <Link href="/resume" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900">Resume Builder</Link>
              <Link href="/cover-letter" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900">Cover Letter Generator</Link>

              <div className="px-4 py-2 text-neutral-400">
                <div className="text-neutral-500">Project List Builder</div>
                <div className="text-[10px] uppercase tracking-wide bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded inline-block mt-1">
                  Coming Soon
                </div>
              </div>

              <Link href="/pricing" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900">Pricing</Link>
              <Link href="/about" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900">About Us</Link>
              <Link href="/contact" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900">Contact Us</Link>
            </div>
          )}
        </div>
      </div>

      {/* BRANDING — centered against the full page width, not affected by menu button */}
      <div className="w-full text-center px-4 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <img
          src="/brand/Tradepro-logo.svg"
          alt="TradePro Technologies"
          className="inline-block w-[220px] sm:w-[380px] md:w-[500px] lg:w-[620px] h-auto"
          style={{ transform: "translateX(-12%)" }}
        />
        <p
          className="font-semibold text-neutral-600 mt-4 leading-snug
                     text-base sm:text-2xl md:text-3xl lg:text-4xl"
        >
          Built for the trades. Engineered to get you hired.
        </p>
      </div>
    </header>
  );
}
