"use client";

import { Environment } from "@react-three/drei";

export function Scene() {
  return (
    <>
      {/* Ambient lighting for visibility */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Placeholder mesh - will be replaced with particle system */}
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          wireframe
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
        />
      </mesh>
    </>
  );
}
