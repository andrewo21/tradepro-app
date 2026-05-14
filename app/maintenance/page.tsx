"use client";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Animated background grid */}
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-lg w-full">
        {/* Logo / brand mark */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 5h14M4 9h10M4 13h12M4 17h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">TradePro</span>
        </div>

        {/* Robot illustration */}
        <div className="flex justify-center mb-8">
          <svg width="96" height="120" viewBox="0 0 72 92" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
              @keyframes blink { 0%,88%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.08)} }
              @keyframes pulse { 0%,100%{opacity:1;r:4} 50%{opacity:0.4;r:6} }
              .rb { animation: bob 2.4s ease-in-out infinite }
              .re { animation: blink 3.5s ease-in-out infinite; transform-origin:center }
              .re2 { animation: blink 3.5s ease-in-out infinite 0.3s; transform-origin:center }
            `}</style>
            <g className="rb">
              <line x1="36" y1="4" x2="36" y2="14" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="36" cy="4" r="5" fill="#818cf8" style={{animation:"pulse 1.8s ease-in-out infinite"}}/>
              <rect x="10" y="14" width="52" height="36" rx="12" fill="#312e81"/>
              <rect x="15" y="19" width="42" height="26" rx="8" fill="#1e1b4b"/>
              <g className="re"><ellipse cx="26" cy="32" rx="5.5" ry="5" fill="#818cf8"/><ellipse cx="26" cy="32" rx="3" ry="2.5" fill="#312e81"/><circle cx="27.5" cy="30.5" r="1.2" fill="white" opacity="0.85"/></g>
              <g className="re2"><ellipse cx="46" cy="32" rx="5.5" ry="5" fill="#818cf8"/><ellipse cx="46" cy="32" rx="3" ry="2.5" fill="#312e81"/><circle cx="47.5" cy="30.5" r="1.2" fill="white" opacity="0.85"/></g>
              <rect x="28" y="40" width="16" height="2.5" rx="1.25" fill="#6366f1" opacity="0.8"/>
              <rect x="27" y="50" width="18" height="7" rx="3" fill="#1e1b4b"/>
              <rect x="6" y="57" width="60" height="34" rx="12" fill="#3730a3"/>
              <rect x="6" y="57" width="60" height="14" rx="12" fill="#4338ca" opacity="0.5"/>
              <rect x="12" y="63" width="28" height="20" rx="5" fill="#1e1b4b"/>
              <circle cx="18" cy="68" r="2.8" fill="#6366f1" opacity="0.9"/>
              <circle cx="26" cy="68" r="2.8" fill="#818cf8" opacity="0.6"/>
              <circle cx="34" cy="68" r="2.8" fill="#6366f1" opacity="0.9"/>
              <circle cx="18" cy="76" r="2.8" fill="#818cf8" opacity="0.6"/>
              <circle cx="26" cy="76" r="2.8" fill="#6366f1" opacity="0.9"/>
              <circle cx="34" cy="76" r="2.8" fill="#818cf8" opacity="0.6"/>
              <circle cx="52" cy="71" r="8" fill="#312e81"/>
              <circle cx="52" cy="71" r="6" fill="#4f46e5"/>
              <rect x="51" y="65" width="2" height="7" rx="1" fill="white" opacity="0.9"/>
              <path d="M 48 68 A 5 5 0 1 0 56 68" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9"/>
              <rect x="0" y="60" width="8" height="24" rx="4" fill="#3730a3"/>
              <ellipse cx="4" cy="86" rx="5" ry="5" fill="#312e81"/>
              <rect x="64" y="60" width="8" height="24" rx="4" fill="#3730a3"/>
              <ellipse cx="68" cy="86" rx="5" ry="5" fill="#312e81"/>
            </g>
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          We&apos;re leveling up.
        </h1>
        <p className="text-gray-400 text-base leading-relaxed mb-8">
          TradePro is undergoing scheduled maintenance.
          We&apos;ll be back shortly with something better than you left.
        </p>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Maintenance in progress
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-gray-700">
          Questions?{" "}
          <a href="mailto:support@tradepro.app" className="text-gray-600 hover:text-gray-400 underline transition-colors">
            support@tradepro.app
          </a>
        </p>
      </div>
    </div>
  );
}
