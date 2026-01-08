"use client";

import { Environment } from "@react-three/drei";
import { Hero3D } from "./Hero3D";
import { Effects } from "./Effects";

export function Scene() {
  return (
    <>
      {/* Subtle ambient lighting */}
      <ambientLight intensity={0.2} />

      {/* Environment for atmosphere */}
      <Environment preset="night" />

      {/* Hero particle system with interactions */}
      <Hero3D />

      {/* Post-processing effects */}
      <Effects />
    </>
  );
}
