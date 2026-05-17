"use client";

// AssistantFloat — the floating 3D character in the builder.
// Uses model-viewer for true 3D (same GLB as landing page).
// Larger than before — user can see the full character.

import { useEffect, useState } from "react";
import Image from "next/image";

interface Props {
  src:        "/cv1.glb" | "/gringo.glb";
  fallback:   "/cv1-hero.png" | "/gringo-hero.png";
  alt:        string;
  size?:      number;
  isThinking?: boolean;
}

export default function AssistantFloat({ src, fallback, alt, size = 120, isThinking = false }: Props) {
  const [ready, setReady] = useState(false);
  const h = Math.round(size * 1.3);

  useEffect(() => {
    if (customElements.get("model-viewer")) { setReady(true); return; }
    const s = document.createElement("script");
    s.type    = "module";
    s.src     = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    s.onload  = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  return (
    <div style={{ width: size, height: h }} className="relative flex-shrink-0">
      {!ready ? (
        <Image
          src={fallback} alt={alt}
          width={size} height={h}
          className="object-contain drop-shadow-xl select-none"
          style={{ filter: isThinking ? "brightness(0.8)" : "none" }}
          draggable={false}
        />
      ) : (
        // @ts-ignore
        <model-viewer
          src={src}
          alt={alt}
          auto-rotate
          rotation-per-second="20deg"
          disable-zoom
          camera-orbit="0deg 75deg auto"
          field-of-view="auto"
          interaction-prompt="none"
          shadow-intensity="0.6"
          exposure="1.1"
          style={{
            width: "100%", height: "100%",
            background: "transparent",
            filter: isThinking ? "brightness(0.8)" : "none",
          }}
        />
      )}
    </div>
  );
}
