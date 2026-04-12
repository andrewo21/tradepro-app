"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Restore click‑outside‑to‑close behavior
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
    <header
      className="w-full border-b bg-white relative z-50"
      style={{
        height: "420px",
        width: "100%",
      }}
    >

      {/* BRANDING — CENTER LOCKED */}
      <div
        style={{
          position: "absolute",
          left: "55%",
          top: "0px",
          transform: "translateX(-80%)",
        }}
      >
        <img
          src="/brand/Tradepro-logo.svg"
          alt="TradePro Technologies"
          width={700}
          height={260}
          style={{ display: "block" }}
        />
      </div>

      {/* TAGLINE — CENTERED WITH FULL MANUAL CONTROL */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "240px",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "100%",
        }}
      >
        <p
          style={{
            fontSize: "48px",
            fontWeight: 600,
            color: "#444",
            lineHeight: "1.2",
          }}
        >
          Built for the trades. Engineered to get you hired.
        </p>
      </div>

      {/* MENU — RIGHT ALIGNED (PDF-SAFE) */}
      <div
        className="menu-ui-only"
        style={{
          position: "absolute",
          right: "40px",
          top: "40px",
        }}
      >
        <div className="relative" ref={menuRef}>
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

    </header>
  );
}
