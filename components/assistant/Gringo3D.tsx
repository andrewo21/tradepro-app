"use client";

// Gringo3D — placeholder until /public/gringo.glb is in place.
// When the GLB file is ready, Three.js + react-three-fiber will be
// reinstalled and this component will render the full 3D scene.
//
// To activate when GLB is ready:
//   1. Place your .glb file at /public/gringo.glb
//   2. Tell the developer — packages will be reinstalled and this
//      component will be upgraded to the full Three.js viewer.

import GringoHero from "./GringoHero";

interface Props {
  size?:      number;
  className?: string;
}

export default function Gringo3D({ size = 320, className = "" }: Props) {
  // Shows the high-quality 3D render image until the animated GLB is ready
  return <GringoHero size={size} />;
}
