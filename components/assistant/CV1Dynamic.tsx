"use client";

import { useEffect, useState } from "react";
import CV1Hero from "./CV1Hero";

export default function CV1Dynamic({ size = 280, className = "" }: { size?: number; className?: string }) {
  const [ready, setReady] = useState(false);
  const h = Math.round(size * 1.25);

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
      {/* Blue glow */}
      <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, #1d4ed8 60%, transparent 80%)", filter: "blur(24px)", transform: "scale(1.2)" }} />

      {!ready && <CV1Hero size={size} />}

      {ready && (
        // @ts-ignore
        <model-viewer
          src="/cv1.glb"
          alt="CV-1 3D"
          auto-rotate
          rotation-per-second="25deg"
          camera-controls
          disable-zoom
          shadow-intensity="0.8"
          exposure="1.1"
          camera-orbit="0deg 80deg 2m"
          min-camera-orbit="auto auto 1.5m"
          max-camera-orbit="auto auto 3m"
          field-of-view="30deg"
          interaction-prompt="none"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      )}
    </div>
  );
}
