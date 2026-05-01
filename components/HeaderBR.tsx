"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ptBR } from "@/lib/i18n/pt-BR";

export default function HeaderBR() {
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

  const nav = ptBR.nav;

  return (
    <header className="w-full relative z-50" style={{ backgroundColor: "#166534" }}>
      {/* Menu button — white on green */}
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8 z-20" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-2 border border-green-400 rounded-md bg-green-700 hover:bg-green-600 text-white text-sm font-medium"
          >
            Menu ▾
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg py-2 text-sm z-50">
              <Link href="/br" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100">{nav.home}</Link>
              <Link href="/br/curriculo" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100">{nav.resume}</Link>
              <Link href="/br/carta" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100">{nav.coverLetter}</Link>
              <Link href="/br/precos" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100">{nav.pricing}</Link>
              <Link href="/br/contato" className="block px-4 py-2 text-neutral-800 hover:bg-neutral-100">{nav.contact}</Link>
              <div className="border-t border-neutral-100 mt-1 pt-1">
                <Link href="/" className="block px-4 py-2 text-neutral-500 hover:bg-neutral-100 text-xs">🇺🇸 English Version</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo — white filter on green background */}
      <div className="w-full text-center px-4 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <img
          src="/brand/Tradepro-logo.svg"
          alt="TradePro Technologies"
          className="inline-block w-[220px] sm:w-[380px] md:w-[500px] lg:w-[620px] h-auto"
          style={{ transform: "translateX(-12%)", filter: "brightness(0) invert(1)" }}
        />
        <div className="flex justify-center mt-2 mb-1">
          <span className="text-xs bg-green-900 text-green-200 font-semibold px-3 py-0.5 rounded-full border border-green-700">
            🇧🇷 Portal Brasil
          </span>
        </div>
        <p className="font-semibold text-green-100 mt-2 leading-snug text-base sm:text-2xl md:text-3xl lg:text-4xl">
          {ptBR.landing.tagline}
        </p>
      </div>
    </header>
  );
}
