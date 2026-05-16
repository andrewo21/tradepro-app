"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, ContactShadows, PresentationControls } from "@react-three/drei";

function CV1Model() {
  const group = useRef<any>(null);
  const { scene, animations } = useGLTF("/cv1.glb");
  const { actions, names }    = useAnimations(animations, group);

  useEffect(() => {
    const clip = names.find(n => /idle|stand|wave|loop|anim/i.test(n)) || names[0];
    if (clip && actions[clip]) {
      actions[clip]!.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  useFrame((_, delta) => {
    if (group.current && names.length === 0) {
      group.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={2.2} position={[0, -1.8, 0]} />
    </group>
  );
}

export default function CV1Viewer({ size = 320 }: { size?: number }) {
  return (
    <div style={{ width: size, height: Math.round(size * 1.25) }} className="relative">
      {/* Blue ambient glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, #1d4ed8 50%, transparent 75%)",
          filter:     "blur(28px)",
          transform:  "scale(1.3)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 32 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 6, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-2, 2, -2]} intensity={0.3} color="#3b82f6" />
        <Environment preset="city" />

        <PresentationControls
          global
          polar={[-0.1, 0.1]}
          azimuth={[-0.3, 0.3]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 300 }}
        >
          <CV1Model />
        </PresentationControls>

        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.4}
          scale={4}
          blur={2.5}
          color="#1d4ed8"
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/cv1.glb");
