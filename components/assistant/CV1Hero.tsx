"use client";

// Large 3D-style CV-1 hero robot for the landing page.
// Blue color scheme with depth layering, glow, and CSS animations.

export default function CV1Hero({ size = 280 }: { size?: number }) {
  const h = Math.round(size * 1.3);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: h }}>
      {/* Ambient glow behind robot */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, #1d4ed8 40%, transparent 70%)",
          filter:     "blur(32px)",
          transform:  "scale(1.2)",
        }}
      />

      <svg
        width={size}
        height={h}
        viewBox="0 0 140 182"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter:   "drop-shadow(0 16px 32px rgba(37,99,235,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
          overflow: "visible",
        }}
      >
        <style>{`
          @keyframes cv1Bob {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-6px); }
          }
          @keyframes cv1Blink {
            0%, 88%, 100% { transform: scaleY(1); }
            94%            { transform: scaleY(0.08); }
          }
          @keyframes cv1AntPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%      { opacity: 0.5; transform: scale(1.3); }
          }
          @keyframes cv1LEDPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.3; }
          }
          @keyframes cv1ShadowPulse {
            0%, 100% { transform: scaleX(1); opacity: 0.25; }
            50%      { transform: scaleX(0.85); opacity: 0.15; }
          }
          .cv1-body    { animation: cv1Bob 2.8s ease-in-out infinite; }
          .cv1-eye-l   { animation: cv1Blink 4s ease-in-out infinite; transform-origin: 52px 66px; }
          .cv1-eye-r   { animation: cv1Blink 4s ease-in-out infinite 0.4s; transform-origin: 88px 66px; }
          .cv1-ant-tip { animation: cv1AntPulse 2s ease-in-out infinite; transform-origin: 70px 8px; }
          .cv1-led-a   { animation: cv1LEDPulse 1.4s ease-in-out infinite; }
          .cv1-led-b   { animation: cv1LEDPulse 1.4s ease-in-out infinite 0.47s; }
          .cv1-led-c   { animation: cv1LEDPulse 1.4s ease-in-out infinite 0.94s; }
          .cv1-shadow  { animation: cv1ShadowPulse 2.8s ease-in-out infinite; transform-origin: 70px 178px; }
        `}</style>

        {/* ── Ground shadow ── */}
        <ellipse cx="70" cy="178" rx="46" ry="6" fill="#1e40af" opacity="0.25" className="cv1-shadow" />

        <g className="cv1-body">

          {/* ══ ANTENNA ══ */}
          {/* Shaft */}
          <line x1="70" y1="8" x2="70" y2="26" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round"/>
          {/* 3D depth — right side of shaft */}
          <line x1="72" y1="10" x2="72" y2="26" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          {/* Tip */}
          <circle cx="70" cy="8" r="7" fill="#3b82f6" className="cv1-ant-tip"/>
          <circle cx="70" cy="8" r="4" fill="#93c5fd"/>
          <circle cx="68" cy="6" r="1.5" fill="white" opacity="0.9"/>

          {/* ══ HEAD — 3D box effect ══ */}
          {/* Right depth face */}
          <path d="M 114 32 L 120 26 L 120 64 L 114 70 Z" fill="#1e3a8a"/>
          {/* Bottom depth face */}
          <path d="M 26 70 L 32 76 L 120 76 L 114 70 Z" fill="#1e40af"/>
          {/* Main front face */}
          <rect x="26" y="26" width="88" height="44" rx="14" fill="url(#headGrad)"/>
          {/* Top edge highlight */}
          <path d="M 30 26 Q 70 21 110 26" stroke="#93c5fd" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>

          {/* ── Visor ── */}
          {/* Visor depth */}
          <rect x="37" y="35" width="68" height="30" rx="8" fill="#0f172a" opacity="0.8"/>
          {/* Visor front */}
          <rect x="34" y="32" width="68" height="30" rx="8" fill="#0f172a"/>
          {/* Visor top gleam */}
          <rect x="34" y="32" width="68" height="8" rx="8" fill="#1e3a8a" opacity="0.7"/>
          {/* Visor inner glow */}
          <rect x="36" y="34" width="64" height="26" rx="6" fill="url(#visorGlow)" opacity="0.15"/>

          {/* ── Eyes ── */}
          <g className="cv1-eye-l">
            <circle cx="52" cy="47" r="9"   fill="url(#eyeGrad)"/>
            <circle cx="52" cy="47" r="5.5" fill="#0f172a"/>
            <circle cx="52" cy="47" r="3"   fill="#3b82f6" opacity="0.9"/>
            <circle cx="54" cy="44" r="2"   fill="white"   opacity="0.95"/>
            <circle cx="50" cy="49" r="1"   fill="#93c5fd" opacity="0.6"/>
          </g>
          <g className="cv1-eye-r">
            <circle cx="88" cy="47" r="9"   fill="url(#eyeGrad)"/>
            <circle cx="88" cy="47" r="5.5" fill="#0f172a"/>
            <circle cx="88" cy="47" r="3"   fill="#3b82f6" opacity="0.9"/>
            <circle cx="90" cy="44" r="2"   fill="white"   opacity="0.95"/>
            <circle cx="86" cy="49" r="1"   fill="#93c5fd" opacity="0.6"/>
          </g>

          {/* ── Mouth / grill ── */}
          <rect x="55" y="58" width="30" height="2.5" rx="1.25" fill="#1d4ed8" opacity="0.7"/>
          {[0,1,2,3,4].map(i => (
            <rect key={i} x={57 + i * 5} y={58} width="3" height="2.5" rx="1" fill="#60a5fa" opacity="0.5"/>
          ))}

          {/* ══ NECK ══ */}
          {/* Neck depth */}
          <rect x="59" y="72" width="16" height="12" rx="4" fill="#1e3a8a"/>
          {/* Neck front */}
          <rect x="56" y="70" width="28" height="12" rx="5" fill="#1d4ed8"/>
          <rect x="60" y="72" width="20" height="3" rx="1.5" fill="#2563eb" opacity="0.6"/>

          {/* ══ BODY — 3D box effect ══ */}
          {/* Right face */}
          <path d="M 118 84 L 124 78 L 124 150 L 118 156 Z" fill="#1e3a8a"/>
          {/* Bottom face */}
          <path d="M 22 156 L 28 162 L 124 162 L 118 156 Z" fill="#1e40af"/>
          {/* Main front body */}
          <rect x="22" y="82" width="96" height="74" rx="16" fill="url(#bodyGrad)"/>
          {/* Shoulder shine */}
          <path d="M 28 82 Q 70 77 112 82" stroke="#60a5fa" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>

          {/* ── Chest panel ── */}
          <rect x="30" y="94" width="48" height="34" rx="8" fill="#0f172a"/>
          <rect x="30" y="94" width="48" height="8"  rx="8" fill="#1e3a8a" opacity="0.6"/>

          {/* Status LEDs — 2 rows × 3 */}
          {[0,1,2].map(i => (
            <circle key={`la${i}`} cx={38 + i*14} cy={103} r="4.5"
              fill={["#3b82f6","#60a5fa","#3b82f6"][i]}
              className={["cv1-led-a","cv1-led-b","cv1-led-c"][i]}/>
          ))}
          {[0,1,2].map(i => (
            <circle key={`lb${i}`} cx={38 + i*14} cy={118} r="4.5"
              fill={["#60a5fa","#3b82f6","#60a5fa"][i]}
              className={["cv1-led-b","cv1-led-c","cv1-led-a"][i]}/>
          ))}

          {/* ── Power button — right chest ── */}
          <circle cx="104" cy="111" r="13" fill="#1e3a8a"/>
          <circle cx="104" cy="111" r="11" fill="url(#btnGrad)"/>
          <rect x="103" y="102" width="3" height="10" rx="1.5" fill="white" opacity="0.95"/>
          <path d="M 98 106 A 8 8 0 1 0 110 106" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.95"/>

          {/* Chest plate bottom text */}
          <text x="54" y="138" textAnchor="middle" fill="#1d4ed8" fontSize="7" fontWeight="bold" letterSpacing="2" opacity="0.8">CV-1™</text>

          {/* ══ LEFT ARM ══ */}
          {/* Arm depth */}
          <rect x="8"  y="88" width="14" height="44" rx="7" fill="#1e3a8a"/>
          {/* Arm front */}
          <rect x="4"  y="86" width="18" height="44" rx="9" fill="url(#armGrad)"/>
          {/* Shoulder bolt */}
          <circle cx="13" cy="91" r="4" fill="#1e40af"/>
          <circle cx="13" cy="91" r="2" fill="#2563eb"/>
          {/* Hand */}
          <ellipse cx="13" cy="134" rx="9" ry="9" fill="#1e3a8a"/>
          <ellipse cx="13" cy="134" rx="7" ry="7" fill="#1d4ed8"/>
          <circle  cx="13" cy="134" r="3" fill="#2563eb" opacity="0.7"/>

          {/* ══ RIGHT ARM ══ */}
          {/* Arm depth */}
          <rect x="118" y="88" width="14" height="44" rx="7" fill="#1e3a8a"/>
          {/* Arm front */}
          <rect x="118" y="86" width="18" height="44" rx="9" fill="url(#armGrad)"/>
          {/* Shoulder bolt */}
          <circle cx="127" cy="91" r="4" fill="#1e40af"/>
          <circle cx="127" cy="91" r="2" fill="#2563eb"/>
          {/* Hand */}
          <ellipse cx="127" cy="134" rx="9" ry="9" fill="#1e3a8a"/>
          <ellipse cx="127" cy="134" rx="7" ry="7" fill="#1d4ed8"/>
          <circle  cx="127" cy="134" r="3" fill="#2563eb" opacity="0.7"/>

          {/* ══ LEGS ══ */}
          {/* Left leg depth */}
          <rect x="40" y="160" width="18" height="18" rx="6" fill="#1e3a8a"/>
          {/* Left leg front */}
          <rect x="36" y="156" width="22" height="20" rx="7" fill="#1d4ed8"/>
          {/* Left foot */}
          <rect x="32" y="172" width="30" height="10" rx="5" fill="#1e40af"/>
          <rect x="34" y="174" width="26" height="6" rx="3" fill="#2563eb" opacity="0.5"/>

          {/* Right leg depth */}
          <rect x="82" y="160" width="18" height="18" rx="6" fill="#1e3a8a"/>
          {/* Right leg front */}
          <rect x="82" y="156" width="22" height="20" rx="7" fill="#1d4ed8"/>
          {/* Right foot */}
          <rect x="78" y="172" width="30" height="10" rx="5" fill="#1e40af"/>
          <rect x="80" y="174" width="26" height="6" rx="3" fill="#2563eb" opacity="0.5"/>

        </g>

        {/* ── Gradient defs ── */}
        <defs>
          <radialGradient id="headGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#3b82f6"/>
            <stop offset="60%"  stopColor="#2563eb"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </radialGradient>
          <radialGradient id="bodyGrad" cx="30%" cy="25%" r="80%">
            <stop offset="0%"   stopColor="#2563eb"/>
            <stop offset="55%"  stopColor="#1d4ed8"/>
            <stop offset="100%" stopColor="#1e3a8a"/>
          </radialGradient>
          <radialGradient id="armGrad" cx="30%" cy="20%" r="80%">
            <stop offset="0%"   stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </radialGradient>
          <radialGradient id="eyeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#93c5fd"/>
            <stop offset="50%"  stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </radialGradient>
          <radialGradient id="btnGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </radialGradient>
          <linearGradient id="visorGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#93c5fd"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
