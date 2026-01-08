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

      {/* Loading screen - shown during asset loading */}
      <Loader />

      <Canvas
        className="!fixed inset-0"
        gl={{
          antialias: !device.isMobile, // Disable antialiasing on mobile
          alpha: true,
          powerPreference: device.isMobile ? "default" : "high-performance",
          stencil: false, // Disable stencil buffer for better performance
          depth: true,
        }}
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop="always"
        performance={{ min: 0.5 }} // Allow DPR to drop to 0.5 under load
        // Enable touch events for mobile
        onCreated={({ gl }) => {
          // Set initial DPR based on device capabilities
          gl.setPixelRatio(optimalDPR[1]);
        }}
      >
        <Suspense fallback={null}>
          {/* Adaptive DPR based on performance */}
          <AdaptiveDpr pixelated />

          {/* Performance monitoring with adaptive quality */}
          <PerformanceMonitor
            onIncline={() => setDpr(Math.min(optimalDPR[1], 2))} // Cap at device optimal
            onDecline={() => setDpr(Math.max(optimalDPR[0], 1))} // Floor at device minimum
            onChange={({ factor }) => {
              // Gradually adjust DPR based on performance and device capabilities
              const minDpr = device.isMobile ? 0.5 : 1;
              const maxDpr = optimalDPR[1];
              setDpr(Math.max(minDpr, Math.min(maxDpr, 1.5 * factor)));
            }}
            flipflops={3} // Number of performance changes before adjusting
            onFallback={() => setDpr(0.5)} // Emergency fallback for very low-end devices
          >
            {/* Using native scroll via GSAP (not drei ScrollControls) */}
            <Scene />
          </PerformanceMonitor>
          <Preload all />
        </Suspense>
      </Canvas>
    </>
  );
}
