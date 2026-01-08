"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface FeaturesParticlesProps {
  scrollProgress?: number;
  device: DeviceCapabilities;
}

/**
 * Enhanced particle system that morphs during features section
 * Transitions through 3 formations: organic cloud → structured grid → helix spiral
 * Each formation corresponds to a feature card
 */
export function FeaturesParticles({ scrollProgress = 0, device }: FeaturesParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Reduce particle count on mobile for performance
  const count = device.isMobile ? 800 : 2000;

  // Pre-allocate reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Initialize particle data with 3 formations: organic cloud, grid, helix
  const particles = useMemo(() => {
    // 13 floats per particle: 3 positions x 3 formations + 4 animation props
    const data = new Float32Array(count * 13);
    // Layout: x1,y1,z1 (cloud), x2,y2,z2 (grid), x3,y3,z3 (helix), phase, speed, size, colorIdx

    for (let i = 0; i < count; i++) {
      const idx = i * 13;
      const t = i / count; // normalized index 0-1

      // Formation 1: Organic cloud (sphere with noise)
      const cloudRadius = 3 + Math.random() * 5;
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(Math.random() * 2 - 1);
      data[idx + 0] = cloudRadius * Math.sin(phi1) * Math.cos(theta1);
      data[idx + 1] = cloudRadius * Math.sin(phi1) * Math.sin(theta1);
      data[idx + 2] = cloudRadius * Math.cos(phi1);

      // Formation 2: Structured 3D grid
      const gridDim = Math.ceil(Math.cbrt(count));
      const gridSpacing = 0.6;
      const gx = i % gridDim;
      const gy = Math.floor((i / gridDim) % gridDim);
      const gz = Math.floor(i / (gridDim * gridDim));
      data[idx + 3] = (gx - gridDim / 2) * gridSpacing;
      data[idx + 4] = (gy - gridDim / 2) * gridSpacing;
      data[idx + 5] = (gz - gridDim / 2) * gridSpacing;

      // Formation 3: Double helix spiral (DNA-like)
      const helixHeight = 12;
      const helixRadius = 3;
      const helixTurns = 4;
      const strand = i % 2; // Alternate between two strands
      const helixT = t * helixTurns * Math.PI * 2;
      const helixOffset = strand * Math.PI; // Second strand offset by 180 degrees
      data[idx + 6] = Math.cos(helixT + helixOffset) * helixRadius;
      data[idx + 7] = (t - 0.5) * helixHeight;
      data[idx + 8] = Math.sin(helixT + helixOffset) * helixRadius;

      // Animation properties
      data[idx + 9] = Math.random() * Math.PI * 2; // phase
      data[idx + 10] = 0.5 + Math.random() * 0.5; // speed
      data[idx + 11] = 0.02 + Math.random() * 0.03; // size
      data[idx + 12] = Math.floor(Math.random() * 5); // colorIdx
    }

    return data;
  }, [count]);

  // Color palette
  const colorPalette = useMemo(
    () => [
      new THREE.Color("#8b5cf6"), // violet-500
      new THREE.Color("#a78bfa"), // violet-400
      new THREE.Color("#c4b5fd"), // violet-300
      new THREE.Color("#22d3ee"), // cyan-400
      new THREE.Color("#f472b6"), // pink-400
    ],
    []
  );

  // Smoothed scroll value for buttery transitions
  const smoothScrollRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Smooth scroll interpolation
    smoothScrollRef.current = THREE.MathUtils.lerp(
      smoothScrollRef.current,
      scrollProgress,
      0.08
    );
    const scroll = smoothScrollRef.current;

    // Features section spans roughly 0.2 to 0.6 of total scroll
    // Calculate progress through features section (0 to 1)
    const featuresStart = 0.15;
    const featuresEnd = 0.65;
    const featuresProgress = Math.max(
      0,
      Math.min(1, (scroll - featuresStart) / (featuresEnd - featuresStart))
    );

    // Three formations at 0%, 50%, and 100% of features progress
    // Formation 1 (cloud): 0-33%
    // Formation 2 (grid): 33-66%
    // Formation 3 (helix): 66-100%
    const phase1 = Math.max(0, Math.min(1, featuresProgress * 3)); // 0->1 for first third
    const phase2 = Math.max(0, Math.min(1, (featuresProgress - 0.33) * 3)); // 0->1 for second third
    const phase3 = Math.max(0, Math.min(1, (featuresProgress - 0.66) * 3)); // 0->1 for final third

    // Weights for each formation (smooth blending)
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const w1 = 1 - easeInOut(phase1);
    const w2 = easeInOut(phase1) * (1 - easeInOut(phase2));
    const w3 = easeInOut(phase2);

    // Visibility: only show during features section
    const visibility = featuresProgress > 0 && featuresProgress < 1 ? 1 : 0;

    for (let i = 0; i < count; i++) {
      const idx = i * 13;

      // Get all three formation positions
      const x1 = particles[idx + 0], y1 = particles[idx + 1], z1 = particles[idx + 2];
      const x2 = particles[idx + 3], y2 = particles[idx + 4], z2 = particles[idx + 5];
      const x3 = particles[idx + 6], y3 = particles[idx + 7], z3 = particles[idx + 8];

      const phase = particles[idx + 9];
      const speed = particles[idx + 10];
      const size = particles[idx + 11];
      const colorIdx = particles[idx + 12];

      // Blend between all three formations using weights
      const x = x1 * w1 + x2 * w2 + x3 * w3;
      const y = y1 * w1 + y2 * w2 + y3 * w3;
      const z = z1 * w1 + z2 * w2 + z3 * w3;

      // Add wave motion during transitions
      const transitionAmount = Math.min(w1, 1 - w1) + Math.min(w2, 1 - w2) + Math.min(w3, 1 - w3);
      const wave = Math.sin(time * speed + phase + x * 0.3) * transitionAmount * 0.8;

      tempObject.position.set(x, y + wave, z);

      // Scale: larger during transitions, smaller on mobile
      const mobileScale = device.isMobile ? 0.8 : 1;
      const baseScale = size * (1 + transitionAmount * 0.3) * mobileScale * visibility;
      tempObject.scale.setScalar(baseScale);

      // Rotation based on formation and time
      tempObject.rotation.x = time * speed * 0.3 * w3;
      tempObject.rotation.y = time * speed * 0.5 * (w2 + w3);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color transitions between formations
      tempColor.copy(colorPalette[Math.floor(colorIdx) % colorPalette.length]);

      // Brightness modulation - brighter during grid, cyan tint during helix
      const brightness = 0.7 + Math.sin(time * 2 + phase) * 0.2 + w2 * 0.3 + w3 * 0.2;
      tempColor.multiplyScalar(brightness);

      // Add cyan tint for helix formation
      if (w3 > 0.1) {
        tempColor.lerp(new THREE.Color("#22d3ee"), w3 * 0.3);
      }

      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Rotate entire system based on scroll and formation
    meshRef.current.rotation.y = time * 0.08 + featuresProgress * Math.PI * 0.5;
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 * (w2 + w3);
  });

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((mat) => mat.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
    };
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.3}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
