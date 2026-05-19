"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type GringoMood =
  | "idle"
  | "wave"
  | "talking"
  | "thinking"
  | "happy"
  | "celebrate"
  | "polish"
  | "shrug";

const FRAME: Record<GringoMood, string> = {
  idle:      "/gringo-bust.png",
  wave:      "/gringo-bust-wave.png",
  talking:   "/gringo-bust-talking.png",
  thinking:  "/gringo-bust-thinking.png",
  happy:     "/gringo-bust-happy.png",
  celebrate: "/gringo-bust-celebrate.png",
  polish:    "/gringo-bust-thinking.png",
  shrug:     "/gringo-bust.png",
};

const ANIMATION: Record<GringoMood, string> = {
  idle:      "gringo-bob",
  wave:      "gringo-wave-anim",
  talking:   "gringo-bob",
  thinking:  "gringo-tilt",
  happy:     "gringo-bounce",
  celebrate: "gringo-bounce-big",
  polish:    "gringo-bob",
  shrug:     "gringo-bob",
};

interface Props {
  mood?:      GringoMood;
  size?:      number;
  className?: string;
}

export default function GringoCharacter({ mood = "idle", size = 120, className = "" }: Props) {
  const [current, setCurrent] = useState<GringoMood>(mood);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    if (mood === current) return;
    setFading(true);
    const t = setTimeout(() => { setCurrent(mood); setFading(false); }, 120);
    return () => clearTimeout(t);
  }, [mood]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        @keyframes gringoBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes gringoBounce { 0%,100%{transform:translateY(0) scale(1)} 30%{transform:translateY(-10px) scale(1.04)} 60%{transform:translateY(-4px) scale(1.01)} }
        @keyframes gringoBounceBig { 0%,100%{transform:translateY(0) scale(1)} 20%{transform:translateY(-18px) scale(1.06)} 50%{transform:translateY(-8px) scale(1.02)} 70%{transform:translateY(-14px) scale(1.05)} }
        @keyframes gringoTilt { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
        @keyframes gringoWaveAnim { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-6px) rotate(-2deg)} 75%{transform:translateY(-3px) rotate(2deg)} }
        .gringo-bob        { animation: gringoBob        2.4s ease-in-out infinite; }
        .gringo-bounce     { animation: gringoBounce      0.7s ease-in-out; }
        .gringo-bounce-big { animation: gringoBounceBig   1s ease-in-out; }
        .gringo-tilt       { animation: gringoTilt        2s ease-in-out infinite; }
        .gringo-wave-anim  { animation: gringoWaveAnim    1.4s ease-in-out infinite; }
        .gringo-fade-out   { opacity:0; transition:opacity 0.12s ease; }
        .gringo-fade-in    { opacity:1; transition:opacity 0.12s ease; }
      `}</style>

      <div
        className={`relative flex-shrink-0 overflow-hidden rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        <div className={`${ANIMATION[current]} ${fading ? "gringo-fade-out" : "gringo-fade-in"} w-full h-full`}>
          <Image
            src={FRAME[current]}
            alt={`Gringo ${current}`}
            fill
            className="object-cover select-none"
            draggable={false}
            priority
          />
        </div>
      </div>
    </>
  );
}
