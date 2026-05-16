"use client";

import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";

function Model() {
  const group = useRef<any>(null);
  const { scene, animations } = useGLTF("/cv1.glb");
  const { actions, names }    = useAnimations(animations, group);

  useEffect(() => {
    if (names.length > 0) {
      const clip = names[0];
      actions[clip]?.reset().fadeIn(0.4).play();
    }
  }, [actions, names]);

  useFrame((_, delta) => {
    if (group.current && names.length === 0) {
      group.current.rotation.y += delta * 0.3;
    }
  });

  return <group ref={group}><primitive object={scene} scale={2} position={[0, -1.6, 0]} /></group>;
}

export default function CV1Viewer({ size = 320 }: { size?: number }) {
  const h = Math.round(size * 1.25);
  return (
    <div style={{ width: size, height: h }} className="relative">
      <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, #1d4ed8 60%, transparent 80%)", filter: "blur(24px)", transform: "scale(1.2)" }} />
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 35 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} />
        <directionalLight position={[-2, 2, -2]} intensity={0.3} color="#3b82f6" />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/cv1.glb");
