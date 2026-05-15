"use client";

export type CharacterMood = "idle" | "thinking" | "talking" | "happy" | "waving";

interface Props {
  mood: CharacterMood;
  size?: number;
}

export function AssistantCharacter({ mood, size = 88 }: Props) {
  const h = Math.round(size * 1.28);
  const eyeColor  = mood === "happy" ? "#34d399" : "#a5b4fc";
  const mouthHappy = mood === "happy" || mood === "waving";

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 72 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes rexBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes rexBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.1); }
        }
        @keyframes rexAntennaPulse {
          0%, 100% { opacity: 1; r: 4; }
          50%      { opacity: 0.4; r: 6; }
        }
        @keyframes rexAntennaThink {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
        }
        @keyframes rexWave {
          0%, 100% { transform: rotate(0deg);   transform-origin: bottom center; }
          25%       { transform: rotate(-25deg); transform-origin: bottom center; }
          75%       { transform: rotate(25deg);  transform-origin: bottom center; }
        }
        @keyframes rexChestLED {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        .rex-body { animation: rexBob 2.4s ease-in-out infinite; }
        .rex-eye  { animation: rexBlink 3.5s ease-in-out infinite; transform-origin: center; }
        .rex-eye-r { animation: rexBlink 3.5s ease-in-out infinite 0.3s; transform-origin: center; }
        .rex-arm-wave { animation: rexWave 0.6s ease-in-out infinite; }
        .rex-led-1 { animation: rexChestLED 1.2s ease-in-out infinite; }
        .rex-led-2 { animation: rexChestLED 1.2s ease-in-out infinite 0.4s; }
        .rex-led-3 { animation: rexChestLED 1.2s ease-in-out infinite 0.8s; }
      `}</style>

      <g className="rex-body">
        {/* ── Antenna ── */}
        <line x1="36" y1="4" x2="36" y2="14" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
        {mood === "thinking" ? (
          <g style={{ transformOrigin: "36px 4px", animation: "rexAntennaThink 1s linear infinite" }}>
            <circle cx="36" cy="4" r="5" fill="#818cf8"/>
            <circle cx="36" cy="4" r="2.5" fill="#4f46e5"/>
          </g>
        ) : (
          <circle cx="36" cy="4" r="5" fill="#818cf8" style={{
            animation: "rexAntennaPulse 1.8s ease-in-out infinite",
          }}/>
        )}

        {/* ── Head ── */}
        <rect x="10" y="14" width="52" height="36" rx="12" fill="#3730a3"/>
        {/* Head sheen */}
        <path d="M 14 14 Q 36 10 58 14" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

        {/* ── Visor / face screen ── */}
        <rect x="15" y="19" width="42" height="26" rx="8" fill="#1e1b4b"/>
        <rect x="15" y="19" width="42" height="8" rx="8" fill="#2e27a0" opacity="0.6"/>

        {/* ── Eyes ── */}
        <g className="rex-eye">
          <ellipse cx="26" cy="32" rx="5.5" ry="5" fill={eyeColor}/>
          <ellipse cx="26" cy="32" rx="3"   ry="2.5" fill="#312e81"/>
          <circle cx="27.5" cy="30.5" r="1.2" fill="white" opacity="0.85"/>
        </g>
        <g className="rex-eye-r">
          <ellipse cx="46" cy="32" rx="5.5" ry="5" fill={eyeColor}/>
          <ellipse cx="46" cy="32" rx="3"   ry="2.5" fill="#312e81"/>
          <circle cx="47.5" cy="30.5" r="1.2" fill="white" opacity="0.85"/>
        </g>

        {/* ── Mouth ── */}
        {mouthHappy ? (
          <path d="M 27 41 Q 36 47 45 41" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        ) : mood === "thinking" ? (
          <path d="M 28 42 Q 32 40 36 42 Q 40 40 44 42" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        ) : (
          <rect x="28" y="40" width="16" height="2.5" rx="1.25" fill="#6366f1" opacity="0.8"/>
        )}

        {/* ── Neck ── */}
        <rect x="27" y="50" width="18" height="7" rx="3" fill="#312e81"/>
        <rect x="30" y="51" width="12" height="2" rx="1" fill="#4338ca" opacity="0.5"/>

        {/* ── Body ── */}
        <rect x="6" y="57" width="60" height="34" rx="12" fill="#4338ca"/>
        {/* Body gradient sheen */}
        <rect x="6" y="57" width="60" height="14" rx="12" fill="#4f46e5" opacity="0.4"/>

        {/* ── Chest panel ── */}
        <rect x="12" y="63" width="28" height="20" rx="5" fill="#312e81"/>

        {/* Status LEDs */}
        <circle cx="18" cy="68" r="2.8" fill="#6366f1" className="rex-led-1"/>
        <circle cx="26" cy="68" r="2.8" fill="#818cf8" className="rex-led-2"/>
        <circle cx="34" cy="68" r="2.8" fill="#6366f1" className="rex-led-3"/>
        <circle cx="18" cy="76" r="2.8" fill="#818cf8" className="rex-led-2"/>
        <circle cx="26" cy="76" r="2.8" fill="#6366f1" className="rex-led-3"/>
        <circle cx="34" cy="76" r="2.8" fill="#818cf8" className="rex-led-1"/>

        {/* ── Power button (right chest) ── */}
        <circle cx="52" cy="71" r="8"   fill="#3730a3"/>
        <circle cx="52" cy="71" r="6"   fill="#4f46e5"/>
        <rect   x="51"  y="65" width="2" height="7" rx="1"   fill="white" opacity="0.9"/>
        <path d="M 48 68 A 5 5 0 1 0 56 68" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9"/>

        {/* ── Left arm ── */}
        <rect x="0" y="60" width="8" height="24" rx="4" fill="#4338ca"/>
        <ellipse cx="4" cy="86" rx="5" ry="5" fill="#3730a3"/>

        {/* ── Right arm (wave when waving, still otherwise) ── */}
        <g className={mood === "waving" ? "rex-arm-wave" : ""}>
          <rect x="64" y="60" width="8" height="24" rx="4" fill="#4338ca"/>
          <ellipse cx="68" cy="86" rx="5" ry="5" fill="#3730a3"/>
        </g>
      </g>
    </svg>
  );
}
