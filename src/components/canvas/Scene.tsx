"use client";

import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Hero3D } from "./Hero3D";
import { PrismCenterpiece } from "./PrismCenterpiece";
import { FeaturesParticles } from "./FeaturesParticles";
import { Effects } from "./Effects";
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

  const lightRef = useRef<THREE.AmbientLight>(null);
  const envRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Adjust lighting based on scroll
    if (lightRef.current) {
      // Increase intensity as user scrolls to make features more visible
      lightRef.current.intensity = 0.2 + scrollState.scrollProgress * 0.3;
    }

    // Subtle environment rotation based on scroll (reduce on mobile)
    if (envRef.current) {
      const rotationMultiplier = device.isMobile ? 0.1 : 0.2;
      envRef.current.rotation.y = scrollState.scrollProgress * Math.PI * rotationMultiplier;
    }
  });

  return (
    <>
      {/* Subtle ambient lighting */}
      <ambientLight ref={lightRef} intensity={0.2} />

      {/* Environment for atmosphere */}
      <group ref={envRef}>
        <Environment preset="night" />
      </group>

      {/* Prism centerpiece - brand focal point */}
      <PrismCenterpiece
        scrollProgress={scrollState.scrollProgress}
        device={device}
      />

      {/* Hero particle system with interactions */}
      <Hero3D scrollProgress={scrollState.scrollProgress} device={device} />

      {/* Features section morphing particles */}
      <FeaturesParticles scrollProgress={scrollState.scrollProgress} device={device} />

      {/* Post-processing effects - disabled on low-end devices and most mobile */}
      {enableEffects && <Effects device={device} />}
    </>
  );
}
