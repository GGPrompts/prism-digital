"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, ScrollControls } from "@react-three/drei";
import { Leva } from "leva";
import { Suspense } from "react";
import { Scene } from "./Scene";

export function CanvasWrapper() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <>
      <Leva hidden={!isDev} collapsed />
      <Canvas
        className="!fixed inset-0"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.1}>
            <Scene />
          </ScrollControls>
          <Preload all />
        </Suspense>
      </Canvas>
    </>
  );
}
