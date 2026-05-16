"use client";

// Dynamic wrapper — loads GringoViewer only in the browser (no SSR).
// This prevents the WebGL crash during Vercel's server-side build.

import dynamic from "next/dynamic";
import GringoHero from "./GringoHero";

const GringoViewer = dynamic(
  () => import("./GringoViewer"),
  {
    ssr:     false,
    loading: () => <GringoHero size={280} />,  // shows static image while 3D loads
  }
);

interface Props {
  size?: number;
  className?: string;
}

export default function GringoDynamic({ size = 280, className = "" }: Props) {
  return (
    <div className={className}>
      <GringoViewer size={size} />
    </div>
  );
}
