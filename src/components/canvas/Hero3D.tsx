"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Particles } from "./Particles";
import { FloatingShapes } from "./FloatingShapes";
import { getOptimalParticleCount } from "@/hooks/useDeviceDetection";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

// Camera keyframes for each section
// Each keyframe defines: position (x, y, z), rotation (x, y, z)
interface CameraKeyframe {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

const CAMERA_KEYFRAMES: Record<string, CameraKeyframe> = {
  hero: {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
  },
  features: {
    position: new THREE.Vector3(0, 0.5, 3),
    rotation: new THREE.Euler(0.1, 0, 0),
  },
  process: {
    position: new THREE.Vector3(0, 1, 5),
    rotation: new THREE.Euler(0.2, 0, 0),
  },
  testimonials: {
    position: new THREE.Vector3(0, 0.3, 2),
    rotation: new THREE.Euler(0.05, 0, 0),
  },
};

// Section order for interpolation
const SECTION_ORDER = ["hero", "features", "process", "testimonials"];

// Check for reduced motion preference
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface Hero3DProps {
  scrollProgress?: number;
  section?: string;
  device: DeviceCapabilities;
}

export function Hero3D({
  scrollProgress: externalScrollProgress = 0,
  section = "hero",
  device,
}: Hero3DProps) {
  const { pointer } = useThree();
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check reduced motion preference on mount and when it changes
  useEffect(() => {
    setReducedMotion(prefersReducedMotion());

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const safeScrollTarget = THREE.MathUtils.clamp(
    Number.isFinite(externalScrollProgress) ? externalScrollProgress : 0,
    0,
    1
  );

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

  // Pre-allocated vectors for camera interpolation (avoid GC in useFrame)
  const targetCameraPosition = useRef(new THREE.Vector3());
  const targetCameraRotation = useRef(new THREE.Euler());
  const currentSectionRef = useRef(section);

  // Update current section ref
  useEffect(() => {
    currentSectionRef.current = section;
  }, [section]);

  useFrame((state) => {
    // Smooth mouse following (lerp) - reduce on mobile/touch devices
    targetMouseRef.current.set(pointer.x, pointer.y);
    const lerpSpeed = device.isMobile ? 0.02 : 0.05;
    mouseRef.current.lerp(targetMouseRef.current, lerpSpeed);

    // Use external scroll progress from GSAP (native page scroll)
    const targetScroll = safeScrollTarget;

    // Smooth scroll interpolation for buttery smooth transitions
    smoothScrollRef.current = THREE.MathUtils.lerp(
      smoothScrollRef.current,
      targetScroll,
      0.1
    );

    const scrollValue = smoothScrollRef.current;
    scrollOffsetRef.current = scrollValue;

    // Camera movement based on section keyframes
    if (cameraGroupRef.current) {
      // If reduced motion is preferred, use minimal camera movement
      if (reducedMotion) {
        // Just a subtle z-movement with no rotation
        const minimalZ = scrollValue * 1.5;
        cameraGroupRef.current.position.set(0, 0, minimalZ);
        cameraGroupRef.current.rotation.set(0, 0, 0);
      } else {
        // Get current and next section for interpolation
        const currentSection = currentSectionRef.current;
        const sectionIndex = SECTION_ORDER.indexOf(currentSection);
        const nextSectionIndex = Math.min(sectionIndex + 1, SECTION_ORDER.length - 1);

        const currentKeyframe = CAMERA_KEYFRAMES[currentSection] || CAMERA_KEYFRAMES.hero;
        const nextKeyframe =
          CAMERA_KEYFRAMES[SECTION_ORDER[nextSectionIndex]] || currentKeyframe;

        // Calculate progress within current section (0-1)
        // Use scroll progress to interpolate between sections
        const sectionProgress = (scrollValue * (SECTION_ORDER.length - 1)) % 1;

        // Determine which keyframes to blend based on scroll position
        // Smoothly transition from current to next section
        const fromKeyframe = currentKeyframe;
        const toKeyframe =
          scrollValue > (sectionIndex + 0.5) / (SECTION_ORDER.length - 1)
            ? nextKeyframe
            : currentKeyframe;

        // Apply device-specific multipliers
        const positionMultiplier = device.isMobile ? 0.6 : 1;
        const rotationMultiplier = device.isMobile ? 0.5 : 1;

        // Interpolate position
        targetCameraPosition.current.lerpVectors(
          fromKeyframe.position,
          toKeyframe.position,
          sectionProgress
        );

        // Scale by device multiplier
        targetCameraPosition.current.multiplyScalar(positionMultiplier);

        // Interpolate rotation
        targetCameraRotation.current.set(
          THREE.MathUtils.lerp(
            fromKeyframe.rotation.x,
            toKeyframe.rotation.x,
            sectionProgress
          ) * rotationMultiplier,
          THREE.MathUtils.lerp(
            fromKeyframe.rotation.y,
            toKeyframe.rotation.y,
            sectionProgress
          ) * rotationMultiplier,
          THREE.MathUtils.lerp(
            fromKeyframe.rotation.z,
            toKeyframe.rotation.z,
            sectionProgress
          ) * rotationMultiplier
        );

        // Smoothly lerp camera to target position/rotation
        cameraGroupRef.current.position.lerp(targetCameraPosition.current, 0.08);
        cameraGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          cameraGroupRef.current.rotation.x,
          targetCameraRotation.current.x,
          0.08
        );
        cameraGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          cameraGroupRef.current.rotation.y,
          targetCameraRotation.current.y,
          0.08
        );
        cameraGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          cameraGroupRef.current.rotation.z,
          targetCameraRotation.current.z,
          0.08
        );
      }
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
    <>
      <group ref={cameraGroupRef}>
        <group ref={particlesGroupRef}>
          <Particles
            count={particleCount}
            mouse={mouseRef.current}
            scrollOffset={scrollOffsetRef.current}
            device={device}
          />
        </group>
      </group>

      {/* Floating geometric shapes with mouse parallax - outside camera group */}
      <FloatingShapes
        mouse={mouseRef.current}
        scrollOffset={scrollOffsetRef.current}
        device={device}
      />
    </>
  );
}
