"use client";

import dynamic from "next/dynamic";
import CV1Hero from "./CV1Hero";

const CV1Viewer = dynamic(() => import("./CV1Viewer"), {
  ssr: false,
  loading: ({ isLoading }) => (
    <div className="relative">
      <CV1Hero size={280} />
      {isLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading 3D…
        </div>
      )}
    </div>
  ),
});

export default function CV1Dynamic({ size = 280, className = "" }: { size?: number; className?: string }) {
  return <div className={className}><CV1Viewer size={size} /></div>;
}
