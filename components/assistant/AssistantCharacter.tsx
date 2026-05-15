"use client";

export type CharacterMood    = "idle" | "thinking" | "talking" | "happy" | "waving";
export type CharacterVariant = "us" | "br";

interface Props {
  mood:      CharacterMood;
  variant?:  CharacterVariant;
  size?:     number;
}

// ─── Color palettes ───────────────────────────────────────────────────────────

const PALETTE = {
  us: {
    antennaStroke:  "#6366f1",
    antennaBall:    "#818cf8",
    antennaThink:   "#4f46e5",
    head:           "#3730a3",
    headSheen:      "#4f46e5",
    visor:          "#1e1b4b",
    visorSheen:     "#2e27a0",
    eyeIdle:        "#a5b4fc",
    eyeHappy:       "#34d399",
    eyePupil:       "#312e81",
    mouth:          "#6366f1",
    mouthHappy:     "#818cf8",
    neck:           "#312e81",
    neckAccent:     "#4338ca",
    body:           "#4338ca",
    bodySheen:      "#4f46e5",
    chest:          "#312e81",
    led1:           "#6366f1",
    led2:           "#818cf8",
    btnOuter:       "#3730a3",
    btnInner:       "#4f46e5",
    arm:            "#4338ca",
    hand:           "#3730a3",
  },
  br: {
    // Gringo: white/silver robot body, Brazil yellow jersey, blue glowing eyes
    antennaStroke:  "#94a3b8",   // hidden under hat — silver
    antennaBall:    "#cbd5e1",
    antennaThink:   "#64748b",
    head:           "#e2e8f0",   // white/silver head
    headSheen:      "#f8fafc",
    visor:          "#0f172a",   // dark visor
    visorSheen:     "#1e293b",
    eyeIdle:        "#3b82f6",   // BLUE glowing eyes (matches image)
    eyeHappy:       "#60a5fa",
    eyePupil:       "#0f172a",
    mouth:          "#3b82f6",
    mouthHappy:     "#60a5fa",
    neck:           "#cbd5e1",   // silver neck
    neckAccent:     "#e2e8f0",
    body:           "#FACC15",   // Brazil YELLOW jersey
    bodySheen:      "#FDE047",
    chest:          "#0f172a",   // dark chest panel
    led1:           "#3b82f6",   // blue LEDs
    led2:           "#60a5fa",
    btnOuter:       "#15803d",   // green button
    btnInner:       "#22c55e",
    arm:            "#e2e8f0",   // white/silver arms (like the image)
    hand:           "#cbd5e1",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function AssistantCharacter({ mood, variant = "us", size = 88 }: Props) {
  const h  = Math.round(size * 1.28);
  const p  = PALETTE[variant];
  const isBR = variant === "br";

  const eyeColor   = mood === "happy" ? p.eyeHappy : p.eyeIdle;
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
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
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
          50%      { opacity: 0.35; }
        }
        .rex-body  { animation: rexBob 2.4s ease-in-out infinite; }
        .rex-eye   { animation: rexBlink 3.5s ease-in-out infinite; transform-origin: center; }
        .rex-eye-r { animation: rexBlink 3.5s ease-in-out infinite 0.3s; transform-origin: center; }
        .rex-arm-wave { animation: rexWave 0.6s ease-in-out infinite; }
        .rex-led-1 { animation: rexChestLED 1.2s ease-in-out infinite; }
        .rex-led-2 { animation: rexChestLED 1.2s ease-in-out infinite 0.4s; }
        .rex-led-3 { animation: rexChestLED 1.2s ease-in-out infinite 0.8s; }
      `}</style>

      <g className="rex-body">

        {/* ── Antenna ── */}
        <line x1="36" y1="4" x2="36" y2="14" stroke={p.antennaStroke} strokeWidth="2.5" strokeLinecap="round"/>
        {mood === "thinking" ? (
          <g style={{ transformOrigin: "36px 4px", animation: "rexAntennaThink 1s linear infinite" }}>
            <circle cx="36" cy="4" r="5" fill={p.antennaBall}/>
            <circle cx="36" cy="4" r="2.5" fill={p.antennaThink}/>
          </g>
        ) : (
          <circle cx="36" cy="4" r="5" fill={p.antennaBall}
            style={{ animation: "rexAntennaPulse 1.8s ease-in-out infinite" }}/>
        )}

        {/* ── Head ── */}
        <rect x="10" y="14" width="52" height="36" rx="12" fill={p.head}/>
        <path d="M 14 14 Q 36 10 58 14" stroke={p.headSheen} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

        {/* ── Visor ── */}
        <rect x="15" y="19" width="42" height="26" rx="8" fill={p.visor}/>
        <rect x="15" y="19" width="42" height="8"  rx="8" fill={p.visorSheen} opacity="0.6"/>

        {/* ── Eyes ── */}
        <g className="rex-eye">
          <ellipse cx="26" cy="32" rx="5.5" ry="5"   fill={eyeColor}/>
          <ellipse cx="26" cy="32" rx="3"   ry="2.5" fill={p.eyePupil}/>
          <circle  cx="27.5" cy="30.5" r="1.2" fill="white" opacity="0.85"/>
        </g>
        <g className="rex-eye-r">
          <ellipse cx="46" cy="32" rx="5.5" ry="5"   fill={eyeColor}/>
          <ellipse cx="46" cy="32" rx="3"   ry="2.5" fill={p.eyePupil}/>
          <circle  cx="47.5" cy="30.5" r="1.2" fill="white" opacity="0.85"/>
        </g>

        {/* ── Mouth ── */}
        {mouthHappy ? (
          <path d="M 27 41 Q 36 47 45 41" stroke={p.mouthHappy} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        ) : mood === "thinking" ? (
          <path d="M 28 42 Q 32 40 36 42 Q 40 40 44 42" stroke={p.mouth} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        ) : (
          <rect x="28" y="40" width="16" height="2.5" rx="1.25" fill={p.mouth} opacity="0.8"/>
        )}

        {/* ── Neck ── */}
        <rect x="27" y="50" width="18" height="7" rx="3" fill={p.neck}/>
        <rect x="30" y="51" width="12" height="2" rx="1" fill={p.neckAccent} opacity="0.5"/>

        {/* ── Body (jersey) ── */}
        <rect x="6" y="57" width="60" height="34" rx="12" fill={p.body}/>
        <rect x="6" y="57" width="60" height="14" rx="12" fill={p.bodySheen} opacity="0.35"/>

        {/* Brazil jersey details */}
        {isBR && (
          <>
            {/* Green V-collar */}
            <path d="M 24 57 Q 36 67 48 57" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M 27 57 Q 36 64 45 57" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
            {/* Green sleeve cuffs on arms */}
            <rect x="0"  y="72" width="8" height="4" rx="2" fill="#15803d"/>
            <rect x="64" y="72" width="8" height="4" rx="2" fill="#15803d"/>
            {/* "BR" badge on chest */}
            <circle cx="52" cy="65" r="5" fill="#15803d"/>
            <text x="52" y="68" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">BR</text>
          </>
        )}

        {/* ── Chest panel ── */}
        <rect x="12" y="63" width="28" height="20" rx="5" fill={p.chest}/>

        {/* Status LEDs */}
        <circle cx="18" cy="68" r="2.8" fill={p.led1} className="rex-led-1"/>
        <circle cx="26" cy="68" r="2.8" fill={p.led2} className="rex-led-2"/>
        <circle cx="34" cy="68" r="2.8" fill={p.led1} className="rex-led-3"/>
        <circle cx="18" cy="76" r="2.8" fill={p.led2} className="rex-led-2"/>
        <circle cx="26" cy="76" r="2.8" fill={p.led1} className="rex-led-3"/>
        <circle cx="34" cy="76" r="2.8" fill={p.led2} className="rex-led-1"/>

        {/* ── Power button ── */}
        <circle cx="52" cy="71" r="8" fill={p.btnOuter}/>
        <circle cx="52" cy="71" r="6" fill={p.btnInner}/>
        <rect   x="51" y="65" width="2" height="7" rx="1"
          fill={isBR ? p.chest : "white"} opacity="0.95"/>
        <path d="M 48 68 A 5 5 0 1 0 56 68"
          stroke={isBR ? p.chest : "white"} strokeWidth="1.8"
          strokeLinecap="round" fill="none" opacity="0.95"/>

        {/* ── Left arm ── */}
        <rect x="0" y="60" width="8" height="24" rx="4" fill={p.arm}/>
        <ellipse cx="4" cy="86" rx="5" ry="5" fill={p.hand}/>

        {/* ── Right arm ── */}
        <g className={mood === "waving" ? "rex-arm-wave" : ""}>
          <rect x="64" y="60" width="8" height="24" rx="4" fill={p.arm}/>
          <ellipse cx="68" cy="86" rx="5" ry="5" fill={p.hand}/>
        </g>

        {/* ── Straw hat (Gringo / BR only) ── */}
        {isBR && (
          <g>
            {/* Wide brim */}
            <ellipse cx="36" cy="18" rx="30" ry="5.5" fill="#C8943A"/>
            <ellipse cx="36" cy="17" rx="30" ry="5"   fill="#D4A853"/>
            {/* Crown */}
            <path d="M 20 17 Q 19 4 36 2 Q 53 4 52 17 Z" fill="#D4A853"/>
            <path d="M 22 17 Q 21 5 36 3 Q 51 5 50 17 Z" fill="#E8BC6A"/>
            {/* Straw texture lines */}
            <path d="M 25 16 Q 24 7 36 5" stroke="#C8943A" strokeWidth="0.8" fill="none" opacity="0.5"/>
            <path d="M 36 3 L 36 16"      stroke="#C8943A" strokeWidth="0.8" fill="none" opacity="0.5"/>
            <path d="M 47 16 Q 48 7 36 5" stroke="#C8943A" strokeWidth="0.8" fill="none" opacity="0.5"/>
            {/* Hat band — Brazil green with yellow stripe */}
            <rect x="20" y="14" width="32" height="4"   rx="1"    fill="#15803d" opacity="0.9"/>
            <rect x="20" y="14" width="32" height="1.5" rx="0.75" fill="#FACC15" opacity="0.7"/>
          </g>
        )}

      </g>
    </svg>
  );
}
