"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tradepro_intro_seen";

export default function CinematicIntro({ videoId }: { videoId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", padding: "16px",
    }}>
      <div style={{ position: "relative", width: "100%", maxWidth: "900px" }}>
        <button onClick={dismiss} style={{
          position: "absolute", top: "-40px", right: 0,
          color: "rgba(255,255,255,0.7)", background: "none", border: "none",
          fontSize: "14px", cursor: "pointer", letterSpacing: "1px",
        }}>
          SKIP ✕
        </button>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&autopause=0&player_id=0&app_id=58479`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%", borderRadius: "12px",
            }}
            title="TradePro Introduction"
          />
        </div>
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button onClick={dismiss} style={{
            color: "rgba(255,255,255,0.5)", background: "none", border: "none",
            fontSize: "13px", cursor: "pointer",
          }}>
            Continue to site →
          </button>
        </div>
      </div>
    </div>
  );
}
