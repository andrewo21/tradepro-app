"use client";

import dynamic from "next/dynamic";
import CV1Hero from "./CV1Hero";

const CV1Viewer = dynamic(
  () => import("./CV1Viewer"),
  {
    ssr:     false,
    loading: () => <CV1Hero size={280} />,
  }
);

export default function CV1Dynamic({ size = 280, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={className}>
      <CV1Viewer size={size} />
    </div>
  );
}
