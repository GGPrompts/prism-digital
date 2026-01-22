"use client";

import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Hero3D } from "./Hero3D";
import { PrismCenterpiece } from "./PrismCenterpiece";
import { FeaturesParticles } from "./FeaturesParticles";
import { Effects } from "./Effects";
import { GradientMesh } from "./GradientMesh";
import { useGSAPScroll } from "@/hooks/useGSAPScroll";
import { useDeviceDetection, shouldEnableEffects } from "@/hooks/useDeviceDetection";

/**
 * Main 3D Scene
 *
 * Preloading pattern for future assets:
 * - GLTF models: useGLTF.preload('/path/to/model.glb')
 * - Textures: useTexture.preload('/path/to/texture.jpg')
 * - Call preload functions at module level (outside component)
 */

export function Scene() {
  const scrollState = useGSAPScroll();
  const device = useDeviceDetection();
  const enableEffects = shouldEnableEffects(device);
  const scrollProgress = Math.min(
    Math.max(Number.isFinite(scrollState.scrollProgress) ? scrollState.scrollProgress : 0, 0),
    1
  );

  const lightRef = useRef<THREE.AmbientLight>(null);
  const envRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Adjust lighting based on scroll
    if (lightRef.current) {
      // Increase intensity as user scrolls to make features more visible
      lightRef.current.intensity = 0.2 + scrollProgress * 0.3;
    }

    // Subtle environment rotation based on scroll (reduce on mobile)
    if (envRef.current) {
      const rotationMultiplier = device.isMobile ? 0.1 : 0.2;
      envRef.current.rotation.y = scrollProgress * Math.PI * rotationMultiplier;
    }
  });

  return (
    <>
      {/* Animated gradient mesh background - positioned behind everything */}
      <GradientMesh scrollProgress={scrollProgress} device={device} />

      {/* Subtle ambient lighting */}
      <ambientLight ref={lightRef} intensity={0.5} />

      {/* Hero section 3D elements */}
      <Hero3D scrollProgress={scrollProgress} device={device} />

      {/* Glass prism centerpiece */}
      <PrismCenterpiece scrollProgress={scrollProgress} device={device} />

      {/* Features section particles */}
      <FeaturesParticles scrollProgress={scrollProgress} device={device} />

      {/* Post-processing effects - only on capable devices */}
      {enableEffects && <Effects device={device} />}
    </>
  );
}
