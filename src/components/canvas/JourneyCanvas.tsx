"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor, AdaptiveDpr } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { JourneyScene } from "./JourneyScene";
import { Effects } from "./Effects";
import { Loader } from "@/components/ui/Loader";
import {
  useDeviceDetection,
  getOptimalDPR,
  shouldEnableEffects,
} from "@/hooks/useDeviceDetection";
import { WebGLFallback } from "./WebGLFallback";

interface JourneyCanvasProps {
  scrollProgress: number;
}

/**
 * Custom canvas wrapper for the journey experience.
 * Similar to CanvasWrapper but renders JourneyScene instead of main Scene.
 */
export function JourneyCanvas({ scrollProgress }: JourneyCanvasProps) {
  const device = useDeviceDetection();
  const optimalDPR = getOptimalDPR(device);
  const [dpr, setDpr] = useState(optimalDPR[0]);
  const [showFallback, setShowFallback] = useState(false);
  const enableEffects = shouldEnableEffects(device);

  useEffect(() => {
    if (!device.hasWebGL) {
      setShowFallback(true);
    }
  }, [device.hasWebGL]);

  if (showFallback) {
    return <WebGLFallback />;
  }

  return (
    <>
      <Loader />

      <Canvas
        className="!fixed inset-0"
        gl={{
          antialias: !device.isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={dpr}
        camera={{ position: [0, 0, 20], fov: 45, near: 0.1, far: 200 }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onIncline={() => setDpr(Math.min(dpr + 0.5, optimalDPR[1]))}
            onDecline={() => setDpr(Math.max(dpr - 0.5, optimalDPR[0]))}
          >
            <AdaptiveDpr pixelated />
            <JourneyScene scrollProgress={scrollProgress} device={device} />
            {enableEffects && <Effects device={device} />}
            <Preload all />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </>
  );
}
