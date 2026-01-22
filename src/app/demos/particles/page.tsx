"use client";

import { useRef, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, AdaptiveDpr, Preload } from "@react-three/drei";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useDeviceDetection, getOptimalDPR } from "@/hooks/useDeviceDetection";
import { WebGLFallback } from "@/components/canvas/WebGLFallback";
import { ParticleMorphing } from "@/components/canvas/ParticleMorphing";
import { Effects } from "@/components/canvas/Effects";

export default function ParticlesDemoPage() {
  const device = useDeviceDetection();
  const optimalDPR = getOptimalDPR(device);
  const [dpr, setDpr] = useState(optimalDPR[0]);
  const [showStats, setShowStats] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!device.hasWebGL) {
      setShowFallback(true);
    }
  }, [device.hasWebGL]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPaused((p) => !p);
          break;
        case "KeyS":
          setShowStats((s) => !s);
          break;
        case "KeyR":
          // Reset handled in component via ref
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleIncline = useCallback(() => {
    setDpr((d) => Math.min(d + 0.5, optimalDPR[1]));
  }, [optimalDPR]);

  const handleDecline = useCallback(() => {
    setDpr((d) => Math.max(d - 0.5, optimalDPR[0]));
  }, [optimalDPR]);

  if (showFallback) {
    return <WebGLFallback />;
  }

  return (
    <>
      <Header />

      {/* Background gradient - transparent to allow 3D content to show through */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute left-1/2 top-1/3 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl dark:opacity-8"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} className="fixed inset-0">
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
          camera={{ position: [0, 0, 15], fov: 50 }}
          frameloop={isPaused ? "demand" : "always"}
        >
          <Suspense fallback={null}>
            <PerformanceMonitor
              onIncline={handleIncline}
              onDecline={handleDecline}
            >
              <AdaptiveDpr pixelated />
              <ParticleMorphing device={device} isPaused={isPaused} />
              <Effects device={device} />
              <Preload all />
            </PerformanceMonitor>
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <main className="pointer-events-none relative z-10 min-h-screen">
        {/* Back button */}
        <div className="pointer-events-auto fixed left-6 top-24">
          <Link
            href="/demos"
            className="group inline-flex items-center gap-2 rounded-lg bg-background/50 px-4 py-2 text-sm font-medium text-foreground-muted backdrop-blur-sm transition-all hover:bg-background/70 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Demos
          </Link>
        </div>

        {/* Title and instructions */}
        <div className="pointer-events-auto fixed bottom-8 left-8 max-w-md">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Particle Morphing
          </h1>
          <p className="mb-4 text-sm text-foreground-muted md:text-base">
            GPU-accelerated particles morphing between text formations. Move
            your mouse to interact.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-foreground-muted/70">
            <span className="rounded bg-white/5 px-2 py-1">
              [Space] {isPaused ? "Play" : "Pause"}
            </span>
            <span className="rounded bg-white/5 px-2 py-1">[S] Stats</span>
            <span className="rounded bg-white/5 px-2 py-1">[R] Reset</span>
          </div>
        </div>

        {/* Stats overlay */}
        {showStats && (
          <div className="pointer-events-auto fixed right-8 top-24 rounded-lg bg-background/70 p-4 font-mono text-xs text-foreground-muted backdrop-blur-sm">
            <div>GPU Tier: {device.gpu}</div>
            <div>DPR: {dpr.toFixed(1)}</div>
            <div>Mobile: {device.isMobile ? "Yes" : "No"}</div>
            <div>WebGL2: {device.hasWebGL2 ? "Yes" : "No"}</div>
          </div>
        )}

        {/* Pause indicator */}
        {isPaused && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="rounded-lg bg-background/70 px-6 py-3 text-lg font-medium text-foreground backdrop-blur-sm">
              Paused
            </div>
          </div>
        )}
      </main>
    </>
  );
}
