"use client";

import Image from "next/image";

export default function GringoHero({ size = 280 }: { size?: number }) {
  return (
    <div className="relative flex-shrink-0 overflow-hidden rounded-2xl"
      style={{ width: size, height: size }}>
      <div className="absolute inset-0 opacity-20 pointer-events-none"
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
