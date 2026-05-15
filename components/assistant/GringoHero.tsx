"use client";

// Large 3D-style Gringo hero robot for the BR landing page.
// White/silver body, Brazil yellow jersey, blue glowing eyes, straw hat.
// Matches the official Gringo brand image.

export default function GringoHero({ size = 280 }: { size?: number }) {
  const h = Math.round(size * 1.35);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: h }}>
      {/* Ambient glow — green/yellow for Brazil */}
      <div
        className="absolute inset-0 rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, #22c55e 0%, #15803d 40%, transparent 70%)",
          filter:     "blur(32px)",
          transform:  "scale(1.2)",
        }}
      />

      <svg
        width={size}
        height={h}
        viewBox="0 0 160 216"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter:   "drop-shadow(0 20px 40px rgba(0,0,0,0.5)) drop-shadow(0 4px 12px rgba(21,128,61,0.3))",
          overflow: "visible",
        }}
      >
        <style>{`
          @keyframes grBob {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-7px); }
          }
          @keyframes grBlink {
            0%, 88%, 100% { transform: scaleY(1); }
            94%            { transform: scaleY(0.08); }
          }
          @keyframes grLED {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.3; }
          }
          @keyframes grShadow {
            0%, 100% { transform: scaleX(1); opacity: 0.2; }
            50%      { transform: scaleX(0.85); opacity: 0.12; }
          }
          .gr-body   { animation: grBob 2.8s ease-in-out infinite; }
          .gr-eye-l  { animation: grBlink 4s ease-in-out infinite; transform-origin: 56px 78px; }
          .gr-eye-r  { animation: grBlink 4s ease-in-out infinite 0.4s; transform-origin: 104px 78px; }
          .gr-led-a  { animation: grLED 1.3s ease-in-out infinite; }
          .gr-led-b  { animation: grLED 1.3s ease-in-out infinite 0.43s; }
          .gr-led-c  { animation: grLED 1.3s ease-in-out infinite 0.86s; }
          .gr-shadow { animation: grShadow 2.8s ease-in-out infinite; transform-origin: 80px 212px; }
        `}</style>

        {/* Ground shadow */}
        <ellipse cx="80" cy="212" rx="50" ry="6" fill="#15803d" opacity="0.2" className="gr-shadow"/>

        <g className="gr-body">

          {/* ══ STRAW HAT ══ */}
          {/* Hat brim — wide, sits over the head */}
          <ellipse cx="80" cy="38" rx="58" ry="10"   fill="#C8943A"/>
          <ellipse cx="80" cy="36" rx="58" ry="9.5"  fill="#D4A853"/>
          {/* Crown */}
          <path d="M 44 36 Q 42 8 80 4 Q 118 8 116 36 Z" fill="#D4A853"/>
          <path d="M 48 36 Q 46 10 80 6 Q 114 10 112 36 Z" fill="#E8BC6A"/>
          {/* Crown highlight */}
          <path d="M 52 34 Q 50 12 80 8 Q 110 12 108 34" stroke="#F0CA80" strokeWidth="1.5" fill="none" opacity="0.5"/>
          {/* Straw texture */}
          <path d="M 58 34 Q 56 16 80 9"  stroke="#C8943A" strokeWidth="1" fill="none" opacity="0.4"/>
          <path d="M 80 5  L 80 34"       stroke="#C8943A" strokeWidth="1" fill="none" opacity="0.4"/>
          <path d="M 102 34 Q 104 16 80 9" stroke="#C8943A" strokeWidth="1" fill="none" opacity="0.4"/>
          {/* Hat band — Brazil green with yellow stripe */}
          <rect x="44" y="30" width="72" height="8"  rx="2"  fill="#15803d" opacity="0.95"/>
          <rect x="44" y="30" width="72" height="2.5" rx="1" fill="#FACC15" opacity="0.8"/>

          {/* ══ HEAD — white/silver ══ */}
          {/* Head depth face */}
          <path d="M 128 44 L 134 38 L 134 90 L 128 96 Z" fill="#94a3b8"/>
          {/* Head bottom depth */}
          <path d="M 32 96 L 38 102 L 134 102 L 128 96 Z" fill="#cbd5e1"/>
          {/* Head front */}
          <rect x="32" y="44" width="96" height="52" rx="16" fill="url(#headGr)"/>
          {/* Head top edge gleam */}
          <path d="M 38 44 Q 80 38 122 44" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>

          {/* Visor */}
          <rect x="44" y="52" width="72" height="36" rx="10" fill="#0f172a"/>
          <rect x="44" y="52" width="72" height="10"  rx="10" fill="#1e293b" opacity="0.7"/>

          {/* ── EYES — blue glowing ── */}
          <g className="gr-eye-l">
            <circle cx="56"  cy="70" r="11"  fill="url(#eyeGr)"/>
            <circle cx="56"  cy="70" r="6.5" fill="#0f172a"/>
            <circle cx="56"  cy="70" r="3.5" fill="#3b82f6"/>
            <circle cx="58"  cy="67" r="2.5" fill="white" opacity="0.95"/>
            <circle cx="53"  cy="73" r="1.2" fill="#93c5fd" opacity="0.5"/>
          </g>
          <g className="gr-eye-r">
            <circle cx="104" cy="70" r="11"  fill="url(#eyeGr)"/>
            <circle cx="104" cy="70" r="6.5" fill="#0f172a"/>
            <circle cx="104" cy="70" r="3.5" fill="#3b82f6"/>
            <circle cx="106" cy="67" r="2.5" fill="white" opacity="0.95"/>
            <circle cx="101" cy="73" r="1.2" fill="#93c5fd" opacity="0.5"/>
          </g>

          {/* Smile */}
          <path d="M 62 84 Q 80 92 98 84" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

          {/* ══ NECK — silver ══ */}
          <rect x="62" y="98" width="36" height="14" rx="6" fill="#94a3b8"/>
          <rect x="66" y="100" width="28" height="4" rx="2" fill="#cbd5e1" opacity="0.6"/>

          {/* ══ BODY — Brazil YELLOW jersey ══ */}
          {/* Body depth face */}
          <path d="M 136 114 L 142 108 L 142 186 L 136 192 Z" fill="#CA9D00"/>
          {/* Body bottom face */}
          <path d="M 24 192 L 30 198 L 142 198 L 136 192 Z" fill="#D4A800"/>
          {/* Body front */}
          <rect x="24" y="112" width="112" height="80" rx="18" fill="url(#bodyGr)"/>
          {/* Shoulder gleam */}
          <path d="M 32 112 Q 80 106 128 112" stroke="#FDE68A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>

          {/* ── Green V-collar ── */}
          <path d="M 56 112 Q 80 132 104 112" stroke="#15803d" strokeWidth="5"   fill="none" strokeLinecap="round"/>
          <path d="M 60 112 Q 80 128 100 112" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>

          {/* ── BR badge on chest ── */}
          <circle cx="116" cy="130" r="12" fill="#15803d"/>
          <circle cx="116" cy="130" r="10" fill="#16a34a"/>
          <text x="116" y="134" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" letterSpacing="0.5">BR</text>

          {/* ── Chest control panel ── */}
          <rect x="36" y="122" width="60" height="42" rx="8" fill="#0f172a"/>
          <rect x="36" y="122" width="60" height="10"  rx="8" fill="#1e293b" opacity="0.6"/>

          {/* Blue LEDs */}
          {[0,1,2].map(i => (
            <circle key={`la${i}`} cx={48 + i*18} cy={134} r="5.5"
              fill={["#3b82f6","#60a5fa","#3b82f6"][i]}
              className={["gr-led-a","gr-led-b","gr-led-c"][i]}/>
          ))}
          {[0,1,2].map(i => (
            <circle key={`lb${i}`} cx={48 + i*18} cy={150} r="5.5"
              fill={["#60a5fa","#3b82f6","#60a5fa"][i]}
              className={["gr-led-b","gr-led-c","gr-led-a"][i]}/>
          ))}

          {/* "Gringo" text on chest bottom */}
          <text x="66" y="172" textAnchor="middle" fill="#FACC15" fontSize="8" fontWeight="bold" letterSpacing="1" opacity="0.9">GRINGO™</text>

          {/* ══ LEFT ARM — white/silver ══ */}
          <rect x="8"  y="116" width="18" height="52" rx="9" fill="url(#armGr)"/>
          {/* Green cuff */}
          <rect x="8"  y="160" width="18" height="8"  rx="4" fill="#15803d"/>
          {/* Hand */}
          <ellipse cx="17" cy="174" rx="11" ry="10" fill="#e2e8f0"/>
          <ellipse cx="17" cy="174" rx="8"  ry="7"  fill="#f1f5f9"/>
          {/* Knuckles */}
          {[0,1,2].map(i => (
            <rect key={i} x={11 + i*4} y={169} width="3" height="6" rx="1.5" fill="#cbd5e1" opacity="0.7"/>
          ))}

          {/* ══ RIGHT ARM ══ */}
          <rect x="134" y="116" width="18" height="52" rx="9" fill="url(#armGr)"/>
          {/* Green cuff */}
          <rect x="134" y="160" width="18" height="8"  rx="4" fill="#15803d"/>
          {/* Hand */}
          <ellipse cx="143" cy="174" rx="11" ry="10" fill="#e2e8f0"/>
          <ellipse cx="143" cy="174" rx="8"  ry="7"  fill="#f1f5f9"/>
          {[0,1,2].map(i => (
            <rect key={i} x={135 + i*4} y={169} width="3" height="6" rx="1.5" fill="#cbd5e1" opacity="0.7"/>
          ))}

          {/* ══ LEGS ══ */}
          {/* Left */}
          <rect x="44" y="194" width="30" height="20" rx="8"  fill="#94a3b8"/>
          <rect x="40" y="188" width="34" height="22" rx="9"  fill="#e2e8f0"/>
          <rect x="34" y="205" width="44" height="11" rx="5.5" fill="#94a3b8"/>
          <rect x="36" y="207" width="40" height="7"  rx="3.5" fill="#cbd5e1" opacity="0.6"/>
          {/* Right */}
          <rect x="86" y="194" width="30" height="20" rx="8"  fill="#94a3b8"/>
          <rect x="86" y="188" width="34" height="22" rx="9"  fill="#e2e8f0"/>
          <rect x="82" y="205" width="44" height="11" rx="5.5" fill="#94a3b8"/>
          <rect x="84" y="207" width="40" height="7"  rx="3.5" fill="#cbd5e1" opacity="0.6"/>

        </g>

        <defs>
          <radialGradient id="headGr" cx="30%" cy="25%" r="75%">
            <stop offset="0%"   stopColor="#f8fafc"/>
            <stop offset="55%"  stopColor="#e2e8f0"/>
            <stop offset="100%" stopColor="#94a3b8"/>
          </radialGradient>
          <radialGradient id="bodyGr" cx="25%" cy="20%" r="85%">
            <stop offset="0%"   stopColor="#FDE68A"/>
            <stop offset="50%"  stopColor="#FACC15"/>
            <stop offset="100%" stopColor="#CA8A04"/>
          </radialGradient>
          <radialGradient id="armGr" cx="30%" cy="20%" r="80%">
            <stop offset="0%"   stopColor="#f1f5f9"/>
            <stop offset="100%" stopColor="#94a3b8"/>
          </radialGradient>
          <radialGradient id="eyeGr" cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#93c5fd"/>
            <stop offset="50%"  stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
