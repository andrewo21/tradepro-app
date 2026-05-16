"use client";

import { useEffect, useState } from "react";
import GringoHero from "./GringoHero";

export default function GringoDynamic({ size = 280, className = "" }: { size?: number; className?: string }) {
  const [ready, setReady] = useState(false);
  const h = Math.round(size * 1.3);

  // Load model-viewer script once on client
  useEffect(() => {
    if (customElements.get("model-viewer")) { setReady(true); return; }
    const script = document.createElement("script");
    script.type  = "module";
    script.src   = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: h }}>
      {/* Green glow */}
      <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #22c55e 0%, #15803d 60%, transparent 80%)", filter: "blur(24px)", transform: "scale(1.2)" }} />

      {/* Fallback image until model-viewer loads */}
      {!ready && <GringoHero size={size} />}

      {/* model-viewer — renders GLB natively in any browser */}
      {ready && (
        // @ts-ignore — model-viewer is a web component, not a React element
        <model-viewer
          src="/gringo.glb"
          alt="Gringo 3D"
          auto-rotate
          rotation-per-second="30deg"
          camera-controls
          disable-zoom
          shadow-intensity="1"
          exposure="1.2"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      )}
    </div>
  );
}
