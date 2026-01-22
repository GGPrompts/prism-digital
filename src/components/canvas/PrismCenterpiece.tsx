"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useEnvironment } from "@react-three/drei";
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
  const safeScrollProgress = THREE.MathUtils.clamp(
    Number.isFinite(scrollProgress) ? scrollProgress : 0,
    0,
    1
  );

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
        const mat = child.material as THREE.Material;
        if ('opacity' in mat) {
          (mat as THREE.MeshPhysicalMaterial).opacity = 1 - fadeProgress;
        }
      }
    });
  });



  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Point lights for rainbow refraction highlights */}
      <pointLight position={[3, 2, 2]} intensity={2} color="#ff6b9d" />
      <pointLight position={[-3, -1, 2]} intensity={1.5} color="#6366f1" />
      <pointLight position={[0, 3, -2]} intensity={1} color="#22d3ee" />

      {/* Main prism mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, -0.75]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        {/* Use meshPhysicalMaterial for cleaner glass without FBO artifacts */}
        <meshPhysicalMaterial
          envMap={envMap}
          color="#e9d5ff"
          emissive="#a855f7"
          emissiveIntensity={0.3}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={1.5}
          ior={1.5}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Inner glow mesh for enhanced effect - very subtle */}
      <mesh position={[0, 0, -0.75]} scale={0.6} frustumCulled={false}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.03}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
