"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useEnvironment, useCursor } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface PrismCenterpieceProps {
  scrollProgress?: number;
  device?: DeviceCapabilities;
}

/**
 * 3D Prism Centerpiece
 *
 * A glass/crystal prism with rainbow light refraction,
 * serving as the brand centerpiece for Prism Digital.
 */
export function PrismCenterpiece({
  scrollProgress = 0,
  device,
}: PrismCenterpieceProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const safeScrollProgress = THREE.MathUtils.clamp(
    Number.isFinite(scrollProgress) ? scrollProgress : 0,
    0,
    1
  );

  // Hover state for interactivity
  const [hovered, setHovered] = useState(false);
  const smoothHover = useRef(0);
  // Higher emissive in light mode for better visibility
  const baseEmissiveIntensity = isDark ? 0.5 : 0.65;
  const hoverEmissiveIntensity = isDark ? 0.8 : 0.95;

  // Change cursor to pointer when hovering
  useCursor(hovered);

  // Handlers for pointer events
  const onPointerOver = useCallback(() => setHovered(true), []);
  const onPointerOut = useCallback(() => setHovered(false), []);

  // Load environment for reflections
  const envMap = useEnvironment({ preset: "night" });

  // Create triangular prism geometry (extruded triangle)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const size = 1;

    // Equilateral triangle
    shape.moveTo(0, size);
    shape.lineTo(-size * 0.866, -size * 0.5);
    shape.lineTo(size * 0.866, -size * 0.5);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 1.5,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Pre-allocate for animation
  const smoothRotation = useRef({ x: 0, y: 0, z: 0 });
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Smooth hover interpolation (lerp factor 0.1 for smooth transitions)
    const targetHover = hovered ? 1 : 0;
    smoothHover.current = THREE.MathUtils.lerp(smoothHover.current, targetHover, 0.1);
    const hoverProgress = smoothHover.current;

    // Apply hover emissive glow to main prism mesh
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (mat && 'emissiveIntensity' in mat) {
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        baseEmissiveIntensity,
        hoverEmissiveIntensity,
        hoverProgress
      );
    }

    // Slow, elegant rotation
    const rotationSpeed = device?.isMobile ? 0.15 : 0.2;
    targetRotation.current.y = time * rotationSpeed;
    targetRotation.current.x = Math.sin(time * 0.1) * 0.1;
    targetRotation.current.z = Math.cos(time * 0.08) * 0.05;

    // Smooth lerp to target rotation
    smoothRotation.current.x = THREE.MathUtils.lerp(
      smoothRotation.current.x,
      targetRotation.current.x,
      0.05
    );
    smoothRotation.current.y = THREE.MathUtils.lerp(
      smoothRotation.current.y,
      targetRotation.current.y,
      0.05
    );
    smoothRotation.current.z = THREE.MathUtils.lerp(
      smoothRotation.current.z,
      targetRotation.current.z,
      0.05
    );

    meshRef.current.rotation.set(
      smoothRotation.current.x,
      smoothRotation.current.y,
      smoothRotation.current.z
    );

    // Subtle float based on scroll
    const floatY = Math.sin(time * 0.5) * 0.1;

    // Fade out prism as user scrolls past hero (start at 10%, fully gone by 40%)
    const fadeStart = 0.1;
    const fadeEnd = 0.4;
    const fadeProgress = THREE.MathUtils.clamp(
      (safeScrollProgress - fadeStart) / (fadeEnd - fadeStart),
      0,
      1
    );

    // Move up and back as scrolling
    groupRef.current.position.y = floatY + fadeProgress * 3;
    groupRef.current.position.z = -fadeProgress * 5;

    // Scale down as fading
    const scale = 1 - fadeProgress * 0.5;
    groupRef.current.scale.setScalar(Math.max(scale, 0.5));

    // Fade opacity via material (we'll need to access children)
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const childMat = child.material as THREE.Material;
        if ('opacity' in childMat) {
          (childMat as THREE.MeshPhysicalMaterial).opacity = 1 - fadeProgress;
        }
      }
    });
  });



  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Point lights for rainbow refraction highlights */}
      <pointLight position={[3, 2, 2]} intensity={3} color="#ff6b9d" />
      <pointLight position={[-3, -1, 2]} intensity={2.5} color="#6366f1" />
      <pointLight position={[0, 3, -2]} intensity={2} color="#22d3ee" />
      <pointLight position={[0, -2, 3]} intensity={1.5} color="#a855f7" />

      {/* Main prism mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, -0.75]}
        castShadow
        receiveShadow
        frustumCulled={false}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        {/* Use meshPhysicalMaterial for premium glass appearance */}
        {/* Reduced transmission in light mode for better visibility */}
        <meshPhysicalMaterial
          envMap={envMap}
          color={isDark ? "#f5d0fe" : "#e9d5ff"}
          emissive={isDark ? "#c084fc" : "#a855f7"}
          emissiveIntensity={baseEmissiveIntensity}
          roughness={isDark ? 0.02 : 0.05}
          metalness={isDark ? 0.15 : 0.2}
          clearcoat={1}
          clearcoatRoughness={isDark ? 0.05 : 0.08}
          transmission={isDark ? 0.95 : 0.75}
          thickness={2}
          ior={isDark ? 2.0 : 1.8}
          transparent
          opacity={isDark ? 0.92 : 0.88}
          reflectivity={1}
          iridescence={isDark ? 0.3 : 0.4}
          iridescenceIOR={1.3}
          sheen={isDark ? 0.5 : 0.6}
          sheenRoughness={0.2}
          sheenColor={isDark ? "#e879f9" : "#d946ef"}
        />
      </mesh>

      {/* Inner glow mesh for enhanced effect - positioned further back inside prism */}
      <mesh position={[0, 0, -0.9]} scale={0.5} frustumCulled={false}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshBasicMaterial
          color="#d946ef"
          transparent
          opacity={0.06}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary outer glow for depth - positioned inside prism volume */}
      <mesh position={[0, 0, -0.85]} scale={0.6} frustumCulled={false}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.03}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
