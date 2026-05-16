"use client";

import Image from "next/image";

// CV-1 hero — uses the official 3D rendered character image.

export default function CV1Hero({ size = 280 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: Math.round(size * 1.25) }}
    >
      {/* Blue ambient glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, #1d4ed8 50%, transparent 75%)",
          filter:     "blur(24px)",
          transform:  "scale(1.3)",
        }}
      />
      <Image
        src="/cv1-hero.png"
        alt="CV-1 — AI Resume Coach"
        width={size}
        height={Math.round(size * 1.25)}
        className="relative z-10 object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}
