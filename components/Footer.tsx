"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-700">
      <div className="flex flex-col items-center justify-center py-8 px-4 gap-4">
        <img
          src="/brand/Tradepro-logo.svg"
          alt="TradePro Technologies"
          className="w-[280px] sm:w-[360px] md:w-[400px] h-auto"
          style={{ display: "block" }}
        />
        <span className="text-neutral-500 text-center">
          © {new Date().getFullYear()} TradePro Technologies. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
