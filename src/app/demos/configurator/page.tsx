"use client";

import { Suspense, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import { Header } from "@/components/sections/Header";
import { ConfiguratorPanel } from "@/components/ui/ConfiguratorPanel";
import {
  DEFAULT_CONFIG,
  getColorById,
  getMaterialById,
  getEnvironmentById,
} from "@/lib/configurator-data";
import {
  useDeviceDetection,
  getOptimalDPR,
} from "@/hooks/useDeviceDetection";

// Dynamically import 3D scene to avoid SSR issues
const ProductConfigurator = dynamic(
  () =>
    import("@/components/canvas/ProductConfigurator").then((mod) => ({
      default: mod.ProductConfigurator,
    })),
  { ssr: false }
);

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm text-foreground-muted">Loading configurator...</p>
      </div>
    </div>
  );
}

export default function ConfiguratorPage() {
  const device = useDeviceDetection();
  const dprRange = getOptimalDPR(device);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<{ reset: () => void } | null>(null);

  // Configuration state
  const [colorId, setColorId] = useState(DEFAULT_CONFIG.colorId);
  const [materialId, setMaterialId] = useState(DEFAULT_CONFIG.materialId);
  const [environmentId, setEnvironmentId] = useState(DEFAULT_CONFIG.environmentId);

  // Get current configuration objects
  const currentColor = getColorById(colorId);
  const currentMaterial = getMaterialById(materialId);
  const currentEnvironment = getEnvironmentById(environmentId);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setColorId(DEFAULT_CONFIG.colorId);
    setMaterialId(DEFAULT_CONFIG.materialId);
    setEnvironmentId(DEFAULT_CONFIG.environmentId);
    controlsRef.current?.reset();
  }, []);

  // Screenshot functionality
  const handleScreenshot = useCallback(() => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `prism-configurator-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to take screenshot:", error);
    }
  }, []);

  return (
    <>
      <Header />

      {/* Full-screen container */}
      <div className="fixed inset-0 bg-background">
        {/* 3D Canvas - full screen */}
        <Canvas
          ref={canvasRef}
          gl={{
            antialias: true,
            preserveDrawingBuffer: true, // Required for screenshots
            alpha: false,
          }}
          dpr={dprRange}
          camera={{
            position: [0, 0, 5],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          style={{ position: "absolute", inset: 0 }}
        >
          <PerformanceMonitor>
            <AdaptiveDpr pixelated />
          </PerformanceMonitor>
          <Suspense fallback={null}>
            <ProductConfigurator
              color={currentColor}
              material={currentMaterial}
              environment={currentEnvironment}
              controlsRef={controlsRef}
              device={device}
            />
            <Preload all />
          </Suspense>
        </Canvas>

        {/* UI Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Back button and title */}
          <div className="pointer-events-auto absolute left-6 top-24 flex flex-col gap-2">
            <Link
              href="/demos"
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Demos
            </Link>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              <span className="bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-transparent">
                Product Configurator
              </span>
            </h1>
          </div>

          {/* Action buttons - top right */}
          <div className="pointer-events-auto absolute right-6 top-24 flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-md transition-all hover:border-primary/50 hover:bg-background/90"
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleScreenshot}
              className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-md transition-all hover:bg-primary/20"
              title="Download screenshot"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Screenshot</span>
            </button>
          </div>

          {/* Configuration Panel */}
          <ConfiguratorPanel
            colorId={colorId}
            materialId={materialId}
            environmentId={environmentId}
            onColorChange={setColorId}
            onMaterialChange={setMaterialId}
            onEnvironmentChange={setEnvironmentId}
          />

          {/* Instructions - bottom center */}
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
            <p className="rounded-lg bg-background/60 px-4 py-2 text-xs text-foreground-muted backdrop-blur-sm">
              {device.isTouch
                ? "Drag to rotate • Pinch to zoom"
                : "Drag to rotate • Scroll to zoom"}
            </p>
          </div>
        </div>

        {/* Loading state */}
        <Suspense fallback={<LoadingFallback />}>
          <div className="hidden" />
        </Suspense>
      </div>
    </>
  );
}
