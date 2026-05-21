"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LAUNCH = new Date("2026-05-26T00:00:00").getTime();

function getTimeLeft() {
  const diff = LAUNCH - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done:    false,
  };
}

function Pad({ n }: { n: number }) {
  return <>{String(n).padStart(2, "0")}</>;
}

export default function MaintenancePage() {
  const router = useRouter();
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => {
      const t = getTimeLeft();
      setTime(t);
      if (t.done) {
        clearInterval(id);
        router.replace("/");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div
          style={{
            display: "flex",
            gap: "clamp(24px, 6vw, 80px)",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {[
            { value: time.days,    label: "DAYS"    },
            { value: time.hours,   label: "HOURS"   },
            { value: time.minutes, label: "MINUTES" },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "clamp(64px, 16vw, 160px)",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                <Pad n={value} />
              </span>
              <span
                style={{
                  fontSize: "clamp(10px, 1.4vw, 14px)",
                  fontWeight: 600,
                  letterSpacing: "0.25em",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 10, opacity: 0.01, position: "absolute", bottom: 0, left: 0 }}>
        TradePro provides resume and career document analysis. No financial opportunities, job guarantees, or income claims.
      </div>
    </div>
  );
}
