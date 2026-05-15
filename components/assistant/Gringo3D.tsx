"use client";

// Gringo3D — renders the .glb character file with full animations.
// Drop the .glb file into /public/gringo.glb and Gringo comes to life.
//
// To activate:
//   1. Place your .glb file at /public/gringo.glb
//   2. Set GLB_READY = true below
//   3. Deploy — that's it.

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import GringoHero from "./GringoHero";

const GLB_READY = false; // ← flip to true once /public/gringo.glb is in place

// ─── The 3D model ─────────────────────────────────────────────────────────────

function GringoModel() {
  const group  = useRef<any>(null);
  const { scene, animations } = useGLTF("/gringo.glb");
  const { actions, names }    = useAnimations(animations, group);

  useEffect(() => {
    // Play idle animation — try common names artists use
    const idleClip =
      names.find(n => /idle|stand|loop|breathe|wave/i.test(n)) ||
      names[0];
    if (idleClip && actions[idleClip]) {
      actions[idleClip]!.reset().fadeIn(0.3).play();
    }
  }, [actions, names]);

  // Subtle auto-rotate so the model feels alive even without animations
  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.8} position={[0, -1.6, 0]} />
    </group>
  );
}

// ─── Canvas wrapper ───────────────────────────────────────────────────────────

interface Props {
  size?:         number;
  autoRotate?:   boolean;
  className?:    string;
}

export default function Gringo3D({ size = 320, autoRotate = false, className = "" }: Props) {
  if (!GLB_READY) {
    return <GringoHero size={size} />;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: Math.round(size * 1.3) }}
    >
      {/* Green ambient glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #22c55e 0%, #15803d 50%, transparent 75%)",
          filter:     "blur(28px)",
          transform:  "scale(1.3)",
        }}
      />

      <Suspense fallback={<GringoHero size={size} />}>
        <Canvas
          camera={{ position: [0, 0.5, 4], fov: 35 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
          shadows
        >
          {/* Lighting — warm tropical feel */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[3, 5, 3]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-2, 2, -2]} intensity={0.4} color="#22c55e" />

          {/* Environment for metallic reflections */}
          <Environment preset="sunset" />

          {/* The character */}
          <GringoModel />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.35}
            scale={3}
            blur={2}
            color="#15803d"
          />

          {/* Optional orbit — lets users spin Gringo */}
          {autoRotate && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
              autoRotate
              autoRotateSpeed={1.5}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}

// Preload so there's no pop-in
if (GLB_READY) {
  useGLTF.preload("/gringo.glb");
}
