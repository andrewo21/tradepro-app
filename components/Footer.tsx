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

        {/* Social Media Icons */}
        <div className="flex items-center gap-5">
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/tradepro-technologies"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-neutral-500 hover:text-blue-400 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452H17.21v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.986V9h3.102v1.561h.044c.432-.818 1.487-1.681 3.061-1.681 3.274 0 3.878 2.155 3.878 4.958v6.614zM5.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm1.554 13.019H3.783V9h3.108v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/tradeprotech.ai/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-neutral-500 hover:text-pink-400 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.609.074-3.031.435-4.166 1.571C1.751 2.779 1.39 4.201 1.316 5.81 1.258 7.09 1.244 7.498 1.244 12c0 4.502.014 4.91.072 6.19.074 1.609.435 3.031 1.571 4.166 1.135 1.136 2.557 1.497 4.166 1.571 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.609-.074 3.031-.435 4.166-1.571 1.136-1.135 1.497-2.557 1.571-4.166.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.074-1.609-.435-3.031-1.571-4.166C19.178 1.751 17.756 1.39 16.147 1.316 14.867 1.258 14.459 1.244 12 1.244zm0 5.838a4.919 4.919 0 1 0 0 9.838 4.919 4.919 0 0 0 0-9.838zm0 8.107a3.188 3.188 0 1 1 0-6.376 3.188 3.188 0 0 1 0 6.376zm6.406-8.845a1.149 1.149 0 1 0 0 2.298 1.149 1.149 0 0 0 0-2.298z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/61589148565677/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-neutral-500 hover:text-blue-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </a>
        </div>

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
