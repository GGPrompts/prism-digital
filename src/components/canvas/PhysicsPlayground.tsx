"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
  Environment,
  PerformanceMonitor,
  AdaptiveDpr,
  Preload,
} from "@react-three/drei";
import { Leva } from "leva";
import { Suspense, useState, useCallback, useRef } from "react";
import { useDeviceDetection, getOptimalDPR } from "@/hooks/useDeviceDetection";
import { PhysicsScene } from "./physics/PhysicsScene";
import { PhysicsControls } from "./physics/PhysicsControls";
import type { PhysicsObjectType, PresetType } from "./physics/types";

export function PhysicsPlayground() {
  const isDev = process.env.NODE_ENV === "development";
  const device = useDeviceDetection();
  const optimalDPR = getOptimalDPR(device);
  const [dpr, setDpr] = useState(optimalDPR[0]);

  // Physics state
  const [gravityEnabled, setGravityEnabled] = useState(true);
  const [antiGravity, setAntiGravity] = useState(false);
  const [objectCount, setObjectCount] = useState(0);
  const [fps, setFps] = useState(60);

  // Spawn and reset refs (controlled by PhysicsScene)
  const spawnRef = useRef<((type: PhysicsObjectType) => void) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const loadPresetRef = useRef<((preset: PresetType) => void) | null>(null);

  // Handlers
  const handleSpawn = useCallback((type: PhysicsObjectType) => {
    spawnRef.current?.(type);
  }, []);

  const handleReset = useCallback(() => {
    resetRef.current?.();
  }, []);

  const handleLoadPreset = useCallback((preset: PresetType) => {
    loadPresetRef.current?.(preset);
  }, []);

  const handleToggleGravity = useCallback(() => {
    setGravityEnabled((prev) => !prev);
    setAntiGravity(false);
  }, []);

  const handleToggleAntiGravity = useCallback(() => {
    setAntiGravity((prev) => !prev);
    if (!gravityEnabled) setGravityEnabled(true);
  }, [gravityEnabled]);

  // Gravity vector
  const gravity: [number, number, number] = gravityEnabled
    ? antiGravity
      ? [0, 9.81, 0]
      : [0, -9.81, 0]
    : [0, 0, 0];

  // Max objects based on device
  const maxObjects = device.isMobile ? 30 : device.isTablet ? 40 : 60;

  return (
    <div className="relative h-full w-full">
      <Leva hidden={!isDev} collapsed />

      {/* UI Controls Overlay */}
      <PhysicsControls
        gravityEnabled={gravityEnabled}
        antiGravity={antiGravity}
        objectCount={objectCount}
        maxObjects={maxObjects}
        fps={fps}
        onSpawn={handleSpawn}
        onReset={handleReset}
        onToggleGravity={handleToggleGravity}
        onToggleAntiGravity={handleToggleAntiGravity}
        onLoadPreset={handleLoadPreset}
        isMobile={device.isMobile}
      />

      {/* 3D Canvas */}
      <Canvas
        className="!absolute inset-0"
        gl={{
          antialias: !device.isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={dpr}
        camera={{ position: [0, 5, 12], fov: 50 }}
        shadows={!device.isMobile}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onIncline={() => setDpr(Math.min(dpr + 0.5, optimalDPR[1]))}
            onDecline={() => setDpr(Math.max(dpr - 0.5, optimalDPR[0]))}
            onChange={({ fps: currentFps }) => setFps(Math.round(currentFps))}
          >
            <AdaptiveDpr pixelated />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 15, 10]}
              intensity={0.8}
              castShadow={!device.isMobile}
              shadow-mapSize={1024}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.3} color="#a855f7" />

            {/* Environment */}
            <Environment preset="night" />

            {/* Physics World */}
            <Physics gravity={gravity} timeStep="vary">
              <PhysicsScene
                device={device}
                maxObjects={maxObjects}
                onObjectCountChange={setObjectCount}
                spawnRef={spawnRef}
                resetRef={resetRef}
                loadPresetRef={loadPresetRef}
              />
            </Physics>

            <Preload all />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </div>
  );
}
