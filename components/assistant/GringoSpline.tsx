"use client";

import { Suspense, lazy } from "react";
import GringoHero from "./GringoHero";

// ─── Paste your Spline scene URL here when ready ─────────────────────────────
// 1. In Spline: click Export → Publish Online → copy the URL
// 2. Replace the empty string below with your URL
// 3. That's it — Gringo goes live in 3D
const SPLINE_SCENE_URL = "";
// Example: "https://prod.spline.design/abc123xyz/scene.splinecode"
// ─────────────────────────────────────────────────────────────────────────────

const Spline = lazy(() => import("@splinetool/react-spline"));

interface Props {
  size?: number;
  className?: string;
}

export default function GringoSpline({ size = 280, className = "" }: Props) {
  // If no URL yet, show the static image fallback
  if (!SPLINE_SCENE_URL) {
    return <GringoHero size={size} />;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: Math.round(size * 1.35) }}
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

      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <GringoHero size={size} />
          </div>
        }
      >
        <Spline
          scene={SPLINE_SCENE_URL}
          style={{ width: "100%", height: "100%" }}
        />
      </Suspense>
    </div>
  );
}
