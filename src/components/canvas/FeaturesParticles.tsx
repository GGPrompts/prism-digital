"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

/**
 * Enhanced particle system that morphs during features section
 * Transitions from organic blob to structured grid pattern
 */
export function FeaturesParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const scroll = useScroll();

  const count = 2000;

  // Pre-allocate reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Initialize particle data with dual positions (organic + grid)
  const particles = useMemo(() => {
    const data = new Float32Array(count * 10);
    // x, y, z (organic), x2, y2, z2 (grid), phase, speed, size, colorIdx

    for (let i = 0; i < count; i++) {
      const idx = i * 10;

      // Organic position (sphere)
      const radius = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      data[idx + 0] = radius * Math.sin(phi) * Math.cos(theta);
      data[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      data[idx + 2] = radius * Math.cos(phi);

      // Grid position (structured)
      const gridSize = 15;
      const gridSpacing = 0.8;
      const gridIdx = Math.floor(Math.cbrt(i));
      const layer = Math.floor(gridIdx / gridSize);
      const row = Math.floor((gridIdx % gridSize) / Math.sqrt(gridSize));
      const col = gridIdx % Math.sqrt(gridSize);

      data[idx + 3] = (col - gridSize / 2) * gridSpacing;
      data[idx + 4] = (row - gridSize / 2) * gridSpacing;
      data[idx + 5] = (layer - gridSize / 2) * gridSpacing;

      // Animation properties
      data[idx + 6] = Math.random() * Math.PI * 2; // phase
      data[idx + 7] = 0.5 + Math.random() * 0.5; // speed
      data[idx + 8] = 0.02 + Math.random() * 0.03; // size
      data[idx + 9] = Math.floor(Math.random() * 5); // colorIdx
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

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const scrollOffset = scroll?.offset || 0;

    // Features section is roughly 1/3 to 2/3 of scroll (page 2 of 3)
    const featuresProgress = Math.max(
      0,
      Math.min(1, (scrollOffset - 0.33) / 0.33)
    );
    const morph = Math.sin(featuresProgress * Math.PI); // Smooth 0->1->0 curve

    for (let i = 0; i < count; i++) {
      const idx = i * 10;

      // Get positions
      const x1 = particles[idx + 0];
      const y1 = particles[idx + 1];
      const z1 = particles[idx + 2];
      const x2 = particles[idx + 3];
      const y2 = particles[idx + 4];
      const z2 = particles[idx + 5];

      const phase = particles[idx + 6];
      const speed = particles[idx + 7];
      const size = particles[idx + 8];
      const colorIdx = particles[idx + 9];

      // Morph between organic and grid
      const x = THREE.MathUtils.lerp(x1, x2, morph);
      const y = THREE.MathUtils.lerp(y1, y2, morph);
      const z = THREE.MathUtils.lerp(z1, z2, morph);

      // Add wave motion during transition
      const wave =
        Math.sin(time * speed + phase + x * 0.5) * morph * (1 - morph) * 2;

      tempObject.position.set(x, y + wave, z);

      // Scale based on transition
      const baseScale = size * (1 + morph * 0.5);
      tempObject.scale.setScalar(baseScale);

      // Rotation during transition
      tempObject.rotation.x = time * speed * morph;
      tempObject.rotation.y = time * speed * 0.7 * morph;

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color with transition effects
      tempColor.copy(colorPalette[Math.floor(colorIdx)]);

      // Brightness modulation
      const brightness = 0.8 + Math.sin(time * 2 + phase) * 0.2 + morph * 0.3;
      tempColor.multiplyScalar(brightness);

      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    // Rotate entire system during features
    meshRef.current.rotation.y = time * 0.1 + featuresProgress * Math.PI;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
