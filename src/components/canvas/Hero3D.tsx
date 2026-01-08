"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { Particles } from "./Particles";
import { FloatingShapes } from "./FloatingShapes";
import { getOptimalParticleCount } from "@/hooks/useDeviceDetection";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface Hero3DProps {
  scrollProgress?: number;
  device: DeviceCapabilities;
}

export function Hero3D({ scrollProgress: externalScrollProgress, device }: Hero3DProps) {
  const { viewport, pointer } = useThree();
  const scroll = useScroll();

  // Get optimal particle count based on device
  const particleCount = getOptimalParticleCount(device);

  // Track smooth mouse position
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const targetMouseRef = useRef(new THREE.Vector2(0, 0));

  // Track scroll offset (using ref instead of state to avoid re-renders)
  const scrollOffsetRef = useRef(0);

  // Camera reference for scroll-based movement
  const cameraGroupRef = useRef<THREE.Group>(null!);
  const particlesGroupRef = useRef<THREE.Group>(null!);

  // Smoothed scroll value for buttery transitions
  const smoothScrollRef = useRef(0);

  useFrame((state) => {
    // Smooth mouse following (lerp) - reduce on mobile/touch devices
    targetMouseRef.current.set(pointer.x, pointer.y);
    const lerpSpeed = device.isMobile ? 0.02 : 0.05;
    mouseRef.current.lerp(targetMouseRef.current, lerpSpeed);

    // Use external scroll progress if provided (from GSAP), otherwise fall back to drei scroll
    const targetScroll = externalScrollProgress ?? (scroll?.offset || 0);

    // Smooth scroll interpolation for buttery smooth transitions
    smoothScrollRef.current = THREE.MathUtils.lerp(
      smoothScrollRef.current,
      targetScroll,
      0.1
    );

    const scrollValue = smoothScrollRef.current;
    scrollOffsetRef.current = scrollValue;

    // Camera movement based on scroll
    if (cameraGroupRef.current) {
      // Move camera back as user scrolls (reduce movement on mobile)
      const zMultiplier = device.isMobile ? 2 : 3;
      cameraGroupRef.current.position.z = scrollValue * (zMultiplier + 2);

      // Slight rotation for depth (reduce on mobile)
      const rotationMultiplier = device.isMobile ? 0.15 : 0.3;
      cameraGroupRef.current.rotation.x = scrollValue * rotationMultiplier;
    }

    // Particles group transformations
    if (particlesGroupRef.current) {
      // Spread particles out as user scrolls
      particlesGroupRef.current.scale.setScalar(1 + scrollValue * 2);

      // Rotate particles system (less on mobile)
      const rotationMultiplier = device.isMobile ? 0.3 : 0.5;
      particlesGroupRef.current.rotation.y = scrollValue * Math.PI * rotationMultiplier;
      particlesGroupRef.current.rotation.z = scrollValue * Math.PI * 0.2;
    }

    // Subtle camera sway with mouse (reduced when scrolling, disable on touch for performance)
    if (!device.isTouch) {
      const mouseInfluence = 1 - scrollValue * 0.8;
      const mouseStrength = device.isMobile ? 0.3 : 0.5;
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        pointer.x * mouseStrength * mouseInfluence,
        0.03
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        pointer.y * mouseStrength * mouseInfluence,
        0.03
      );
    }
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={cameraGroupRef}>
      <group ref={particlesGroupRef}>
        <Particles
          count={particleCount}
          mouse={mouseRef.current}
          scrollOffset={scrollOffsetRef.current}
          device={device}
        />
      </group>

      {/* Floating geometric shapes with mouse parallax */}
      <FloatingShapes
        mouse={mouseRef.current}
        scrollOffset={scrollOffsetRef.current}
        device={device}
      />
    </group>
  );
}
