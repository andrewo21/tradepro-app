"use client";

// GringoDynamic — shows the approved Gringo character (yellow polo, TradePro cap).
// No model-viewer, no GLB, no 3D. Just the correct image.

import Image from "next/image";

export default function GringoDynamic({ size = 280, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex-shrink-0 overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #22c55e 0%, #15803d 60%, transparent 80%)", filter: "blur(24px)", transform: "scale(1.2)" }} />
      <Image
        src="/gringo-bust.png?v=3"
        alt="Gringo — AI Resume Coach"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
