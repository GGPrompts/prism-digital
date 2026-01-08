"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ParticlesProps {
  count?: number;
  mouse?: THREE.Vector2;
  scrollOffset?: number;
  device?: DeviceCapabilities;
}

export function Particles({
  count = 3000,
  mouse = new THREE.Vector2(),
  scrollOffset = 0,
  device,
}: ParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  // Pre-allocate reusable objects (avoid GC in render loop)
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempVec2 = useMemo(() => new THREE.Vector3(), []);
  const tempVec3 = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Initialize particle data
  const particles = useMemo(() => {
    const data = new Float32Array(count * 7); // x, y, z, vx, vy, vz, phase

    for (let i = 0; i < count; i++) {
      const idx = i * 7;

      // Position in a sphere
      const radius = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      data[idx + 0] = radius * Math.sin(phi) * Math.cos(theta); // x
      data[idx + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
      data[idx + 2] = radius * Math.cos(phi); // z

      // Velocity (for organic motion)
      data[idx + 3] = (Math.random() - 0.5) * 0.02; // vx
      data[idx + 4] = (Math.random() - 0.5) * 0.02; // vy
      data[idx + 5] = (Math.random() - 0.5) * 0.02; // vz

      // Phase offset for animation
      data[idx + 6] = Math.random() * Math.PI * 2;
    }

    return data;
  }, [count]);

  // Purple color variations
  const colorPalette = useMemo(
    () => [
      new THREE.Color("#8b5cf6"), // violet-500
      new THREE.Color("#a78bfa"), // violet-400
      new THREE.Color("#7c3aed"), // violet-600
      new THREE.Color("#c4b5fd"), // violet-300
      new THREE.Color("#6d28d9"), // violet-700
    ],
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Reduce interaction strength on mobile for better performance
    const mouseInfluence = device?.isMobile ? 1.5 : 2.5;
    const scrollInfluence = device?.isMobile ? 1.2 : 2.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 7;

      // Get particle data
      let x = particles[idx + 0];
      let y = particles[idx + 1];
      let z = particles[idx + 2];
      const vx = particles[idx + 3];
      const vy = particles[idx + 4];
      const vz = particles[idx + 5];
      const phase = particles[idx + 6];

      // Organic flowing motion using noise-like sine waves
      const flowSpeed = 0.3;
      const flowX =
        Math.sin(time * flowSpeed + phase) * 0.01 +
        Math.cos(time * flowSpeed * 0.7 + y * 0.1) * 0.005;
      const flowY =
        Math.cos(time * flowSpeed + phase) * 0.01 +
        Math.sin(time * flowSpeed * 0.5 + x * 0.1) * 0.005;
      const flowZ =
        Math.sin(time * flowSpeed * 0.8 + phase) * 0.008 +
        Math.cos(time * flowSpeed * 0.3 + x * 0.1) * 0.004;

      // Apply velocity + flow
      x += vx + flowX;
      y += vy + flowY;
      z += vz + flowZ;

      // Mouse interaction - subtle repulsion (using pre-allocated vectors)
      tempVec.set(x, y, z);
      tempVec2.set(mouse.x * 5, mouse.y * 5, 2);
      const distanceToMouse = tempVec.distanceTo(tempVec2);

      if (distanceToMouse < 3) {
        const repulsion = (3 - distanceToMouse) / 3;
        tempVec3.copy(tempVec).sub(tempVec2).normalize();
        x += tempVec3.x * repulsion * mouseInfluence * 0.05;
        y += tempVec3.y * repulsion * mouseInfluence * 0.05;
        z += tempVec3.z * repulsion * mouseInfluence * 0.03;
      }

      // Scroll reactivity - expand/contract particle field
      const scrollEffect = Math.sin(scrollOffset * Math.PI) * scrollInfluence;
      const radius = Math.sqrt(x * x + y * y + z * z);
      const targetRadius = radius + scrollEffect * 0.1;
      const radiusNorm = targetRadius / radius;
      x *= radiusNorm;
      y *= radiusNorm;
      z *= radiusNorm;

      // Update stored position
      particles[idx + 0] = x;
      particles[idx + 1] = y;
      particles[idx + 2] = z;

      // Set instance transform
      tempObject.position.set(x, y, z);

      // Size variation based on depth and scroll
      const depthScale = 1 - z / 15;
      const scrollScale = 1 + scrollOffset * 0.3;
      const baseSize = 0.015 + Math.random() * 0.02;
      const scale = baseSize * depthScale * scrollScale;
      tempObject.scale.setScalar(scale);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color variation - pulse with time
      const colorIndex = i % colorPalette.length;
      tempColor.copy(colorPalette[colorIndex]);

      // Subtle brightness pulsing
      const pulse = Math.sin(time * 2 + phase) * 0.2 + 0.8;
      tempColor.multiplyScalar(pulse);

      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
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

  // Use lower geometry detail on mobile for better performance
  const geometrySegments = device?.isMobile ? 6 : 8;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, geometrySegments, geometrySegments]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.35}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
