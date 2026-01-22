"use client";

import { useRef, useEffect, RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ConfiguratorProduct } from "./ConfiguratorProduct";
import type {
  ColorOption,
  MaterialOption,
  EnvironmentOption,
} from "@/lib/configurator-data";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ProductConfiguratorProps {
  color: ColorOption;
  material: MaterialOption;
  environment: EnvironmentOption;
  controlsRef: RefObject<{ reset: () => void } | null>;
  device: DeviceCapabilities;
}

export function ProductConfigurator({
  color,
  material,
  environment,
  controlsRef,
  device,
}: ProductConfiguratorProps) {
  const orbitRef = useRef<OrbitControlsImpl>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const autoRotateTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInteracting = useRef(false);

  // Expose reset function to parent
  useEffect(() => {
    controlsRef.current = {
      reset: () => {
        if (orbitRef.current) {
          orbitRef.current.reset();
        }
      },
    };
  }, [controlsRef]);

  // Handle interaction start - pause auto-rotation
  const handleStart = () => {
    isInteracting.current = true;
    if (autoRotateTimeout.current) {
      clearTimeout(autoRotateTimeout.current);
      autoRotateTimeout.current = null;
    }
  };

  // Handle interaction end - resume auto-rotation after delay
  const handleEnd = () => {
    isInteracting.current = false;
    autoRotateTimeout.current = setTimeout(() => {
      // Auto-rotation resumes naturally
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoRotateTimeout.current) {
        clearTimeout(autoRotateTimeout.current);
      }
    };
  }, []);

  // Smooth group animation
  useFrame((state) => {
    if (!groupRef.current) return;

    // Subtle floating animation
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />

      {/* Environment for reflections */}
      <Environment preset={environment.preset} background={false} />

      {/* Product group */}
      <group ref={groupRef}>
        <ConfiguratorProduct
          color={color}
          material={material}
          device={device}
        />
      </group>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={4}
        resolution={device.isMobile ? 128 : 256}
      />

      {/* Orbit controls */}
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate={!isInteracting.current}
        autoRotateSpeed={1}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        dampingFactor={0.05}
        enableDamping={true}
        onStart={handleStart}
        onEnd={handleEnd}
        makeDefault
      />
    </>
  );
}
