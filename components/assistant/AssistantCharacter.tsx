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
    // Brazil national jersey — green body, gold/yellow accents
    antennaStroke:  "#009B3A",
    antennaBall:    "#FFDF00",
    antennaThink:   "#007A2E",
    head:           "#005C1F",
    headSheen:      "#007A2E",
    visor:          "#001a09",
    visorSheen:     "#004d18",
    eyeIdle:        "#FFDF00",
    eyeHappy:       "#FFD700",
    eyePupil:       "#002d0e",
    mouth:          "#FFDF00",
    mouthHappy:     "#FFD700",
    neck:           "#003d14",
    neckAccent:     "#005C1F",
    body:           "#009B3A",   // Brazil green jersey
    bodySheen:      "#00C44A",
    chest:          "#003d14",
    led1:           "#FFDF00",   // gold LEDs
    led2:           "#FFE44D",
    btnOuter:       "#005C1F",
    btnInner:       "#FFDF00",   // gold power button
    arm:            "#009B3A",
    hand:           "#005C1F",
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

        {/* Brazil jersey collar stripe */}
        {isBR && (
          <>
            <path d="M 26 57 Q 36 63 46 57" stroke="#FFDF00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            {/* Sleeve stripes — gold bands on arms */}
            <rect x="0"  y="64" width="8" height="3" rx="1.5" fill="#FFDF00" opacity="0.9"/>
            <rect x="64" y="64" width="8" height="3" rx="1.5" fill="#FFDF00" opacity="0.9"/>
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

      </g>
    </svg>
  );
}
