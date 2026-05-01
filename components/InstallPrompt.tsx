"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on mobile browsers where the app isn't already installed
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;

    if (isMobile && !isStandalone) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="mb-4 p-3 bg-neutral-900 text-white rounded-xl flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">📱</span>
        <span>
          {isIOS
            ? 'Tap the Share button → "Add to Home Screen" to install TradePro as an app.'
            : 'Tap the menu (⋮) → "Add to Home Screen" to install TradePro as an app.'}
        </span>
      </div>
      <button onClick={() => setShow(false)} className="text-neutral-400 hover:text-white flex-shrink-0">✕</button>
    </div>
  );
}
