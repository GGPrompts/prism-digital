"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor, AdaptiveDpr } from "@react-three/drei";
import { Leva } from "leva";
import { Suspense, useState, useEffect } from "react";
import { Scene } from "./Scene";
import { Loader } from "@/components/ui/Loader";
import { useDeviceDetection, getOptimalDPR } from "@/hooks/useDeviceDetection";
import { WebGLFallback } from "./WebGLFallback";

export function CanvasWrapper() {
  const isDev = process.env.NODE_ENV === "development";
  const device = useDeviceDetection();
  const optimalDPR = getOptimalDPR(device);
  const [dpr, setDpr] = useState(optimalDPR[0]);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Show fallback if WebGL is not supported
    if (!device.hasWebGL) {
      setShowFallback(true);
    }
  }, [device.hasWebGL]);

  // If WebGL is not supported, show fallback UI
  if (showFallback) {
    return <WebGLFallback />;
  }

  return (
    <>
      <Leva hidden={!isDev} collapsed />

      {/* Loading screen */}
      <Loader />

      <Canvas
        className="!fixed inset-0 -z-10"
        gl={{
          antialias: !device.isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onIncline={() => setDpr(Math.min(dpr + 0.5, optimalDPR[1]))}
            onDecline={() => setDpr(Math.max(dpr - 0.5, optimalDPR[0]))}
          >
            <AdaptiveDpr pixelated />
            <Scene />
            <Preload all />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </>
  );
}
