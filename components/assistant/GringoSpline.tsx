"use client";

// GringoSpline — placeholder until a Spline scene URL is configured.
// When ready: paste the Spline scene URL into SPLINE_SCENE_URL below
// and reinstall @splinetool/react-spline.

import GringoHero from "./GringoHero";

const SPLINE_SCENE_URL = "";
// Paste your Spline scene URL here when ready:
// "https://prod.spline.design/YOUR-SCENE-ID/scene.splinecode"

interface Props {
  size?: number;
  className?: string;
}

export default function GringoSpline({ size = 280, className = "" }: Props) {
  // Falls back to static image until Spline scene is configured
  return <GringoHero size={size} />;
}
