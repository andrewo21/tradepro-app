"use client";

// CV-1 2D animated character.
// Frame-swapping + CSS animations — no 3D, no WebGL, instant load.
// Each mood maps to a pre-generated illustration frame.

import Image from "next/image";
import { useEffect, useState } from "react";

export type CV1Mood =
  | "idle"
  | "wave"
  | "talking"
  | "thinking"
  | "happy"
  | "celebrate"
  | "polish"   // arm raises to visor — used when user enters bad data
  | "shrug";   // shoulders raised — used when suggestion is dismissed

const FRAME: Record<CV1Mood, string> = {
  idle:      "/cv1-idle.png",
  wave:      "/cv1-wave.png",
  talking:   "/cv1-talking.png",
  thinking:  "/cv1-thinking.png",
  happy:     "/cv1-idle.png",     // reuse idle with animation overlay
  celebrate: "/cv1-celebrate.png",
  polish:    "/cv1-polish.png",
  shrug:     "/cv1-shrug.png",
};

// CSS animation class per mood
const ANIMATION: Record<CV1Mood, string> = {
  idle:      "cv1-bob",
  wave:      "cv1-wave-anim",
  talking:   "cv1-bob",
  thinking:  "cv1-tilt",
  happy:     "cv1-bounce",
  celebrate: "cv1-bounce-big",
  polish:    "cv1-bob",
  shrug:     "cv1-bob",
};

interface Props {
  mood?:      CV1Mood;
  size?:      number;
  className?: string;
  variant?:   "us" | "br";   // "br" uses Gringo images
}

// Gringo uses the hero image for all moods (individual frames coming later)
const GRINGO_FRAME = "/gringo-hero.png";

export default function CV1Character({ mood = "idle", size = 120, className = "", variant = "us" }: Props) {
  // Both variants: square container, crop to upper body (face + chest + arms)
  if (variant === "br") {
    return (
      <div className={`relative flex-shrink-0 overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}>
        <div className={`${ANIMATION[mood]} w-full h-full`} style={{ transform: "scale(1.4)", transformOrigin: "50% 25%" }}>
          <Image src={GRINGO_FRAME} alt="Gringo" fill
            className="object-contain select-none" draggable={false} priority />
        </div>
      </div>
    );
  }
  const [current, setCurrent]   = useState<CV1Mood>(mood);
  const [fading,  setFading]    = useState(false);

  // Smooth cross-fade when mood changes
  useEffect(() => {
    if (mood === current) return;
    setFading(true);
    const t = setTimeout(() => {
      setCurrent(mood);
      setFading(false);
    }, 120);
    return () => clearTimeout(t);
  }, [mood]); // eslint-disable-line react-hooks/exhaustive-deps

  const h = Math.round(size * 2);

  return (
    <>
      <style>{`
        @keyframes cv1Bob {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes cv1Bounce {
          0%,100% { transform: translateY(0) scale(1); }
          30%      { transform: translateY(-10px) scale(1.04); }
          60%      { transform: translateY(-4px) scale(1.01); }
        }
        @keyframes cv1BounceBig {
          0%,100% { transform: translateY(0) scale(1); }
          20%      { transform: translateY(-18px) scale(1.06); }
          50%      { transform: translateY(-8px) scale(1.02); }
          70%      { transform: translateY(-14px) scale(1.05); }
        }
        @keyframes cv1Tilt {
          0%,100% { transform: rotate(0deg); }
          25%      { transform: rotate(-4deg); }
          75%      { transform: rotate(4deg); }
        }
        @keyframes cv1WaveAnim {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-6px) rotate(-2deg); }
          75%      { transform: translateY(-3px) rotate(2deg); }
        }
        .cv1-bob        { animation: cv1Bob        2.4s ease-in-out infinite; }
        .cv1-bounce     { animation: cv1Bounce      0.7s ease-in-out; }
        .cv1-bounce-big { animation: cv1BounceBig   1s ease-in-out; }
        .cv1-tilt       { animation: cv1Tilt        2s ease-in-out infinite; }
        .cv1-wave-anim  { animation: cv1WaveAnim    1.4s ease-in-out infinite; }
        .cv1-fade-out   { opacity: 0; transition: opacity 0.12s ease; }
        .cv1-fade-in    { opacity: 1; transition: opacity 0.12s ease; }
      `}</style>

      <div
        className={`relative flex-shrink-0 overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <div className={`${ANIMATION[current]} ${fading ? "cv1-fade-out" : "cv1-fade-in"} w-full h-full`}
          style={{ transform: "scale(1.4)", transformOrigin: "50% 22%" }}>
          <Image
            src={FRAME[current]}
            alt={`CV-1 ${current}`}
            fill
            className="object-contain select-none"
            draggable={false}
            priority
          />
        </div>

        {/* Score pop-up on celebrate */}
        {current === "celebrate" && (
          <div
            className="absolute top-0 right-0 text-emerald-400 font-black text-lg pointer-events-none"
            style={{ animation: "cv1BounceBig 1s ease-in-out" }}
          >
            ✓
          </div>
        )}
      </div>
    </>
  );
}
