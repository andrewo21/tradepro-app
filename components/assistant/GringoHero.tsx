"use client";

import Image from "next/image";

// Gringo hero — uses the real 3D rendered character image.
// Drop-in replacement for the SVG version.

export default function GringoHero({ size = 280 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #22c55e 0%, #15803d 50%, transparent 75%)",
          filter:     "blur(24px)",
          transform:  "scale(1.3)",
        }}
      />
      <Image
        src="/gringo-bust.png?v=2"
        alt="Gringo — AI Resume Coach"
        width={size}
        height={size}
        className="relative z-10 object-cover drop-shadow-2xl rounded-2xl"
        priority
      />
    </div>
  );
}
